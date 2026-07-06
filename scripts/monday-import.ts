/* One-off / re-runnable import: pull monday.com Contacts + Deals into our `leads`.
 * Idempotent (skips items already imported, keyed by monday item id stored in the lead
 * payload). Skips the Twilio routing hook so importing never fires emails.
 *
 * Run: pnpm tsx scripts/monday-import.ts            (dry preview — counts only)
 *      pnpm tsx scripts/monday-import.ts --write     (actually create the leads)
 */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
// avoid dev schema push; tables already exist. (cast: TS types NODE_ENV read-only)
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const WRITE = process.argv.includes('--write')
const { listBoards, getBoardItems, itemFields } = await import('@/lib/monday/client')
const { getPayloadClient } = await import('@/lib/payload')

// monday Deal stage → our pipeline stage
function mapStage(stage = ''): string {
  const s = stage.toLowerCase()
  if (/lost|dead|declin/.test(s)) return 'lost'
  if (/won|closed won|complete/.test(s)) return 'won'
  if (/proposal|quote sent|sent/.test(s)) return 'quote-sent'
  if (/quoting|negotiat/.test(s)) return 'quoting'
  if (/contact/.test(s)) return 'contacted'
  return 'new'
}
const num = (v?: string) => (v ? Number(String(v).replace(/[^0-9.]/g, '')) || undefined : undefined)
// Payload's email field validates format — drop anything that isn't a real address.
const validEmail = (e?: string) => (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) ? e.trim() : undefined)

async function pullAll(boardId: string) {
  const items: any[] = []
  let cursor: string | null = null
  do {
    const page = await getBoardItems(boardId, 100, cursor ?? undefined)
    items.push(...page.items)
    cursor = page.cursor
  } while (cursor)
  return items
}

const payload = await getPayloadClient()
const boards = await listBoards()
const find = (name: string) => boards.find((b) => b.name.toLowerCase() === name.toLowerCase())
const contactsB = find('Contacts')
const dealsB = find('Deals')
console.log('boards found →', { Contacts: contactsB?.id, Deals: dealsB?.id })

// existing imported monday ids (idempotency)
const existing = await payload.find({ collection: 'leads', limit: 10000, depth: 0, overrideAccess: true })
const seen = new Set((existing.docs as any[]).map((d) => d.payload?.mondayItemId).filter(Boolean))
console.log('existing leads:', existing.totalDocs, '| already-imported monday ids:', seen.size)

let created = 0, skipped = 0, failed = 0
async function importItem(it: any, source: 'contacts' | 'deals') {
  if (seen.has(it.id)) { skipped++; return }
  const f = itemFields(it)
  const data =
    source === 'contacts'
      ? {
          name: f.name, email: validEmail(f.Email), phone: f.Phone || f['Direct Phone'] || undefined,
          company: f.Company || undefined, sourceForm: 'manual' as const,
          message: f.Title ? `Title: ${f.Title}` : undefined,
          payload: { mondaySource: 'contacts', mondayItemId: it.id, ...f },
        }
      : {
          name: f.name, company: f.Company || undefined, sourceForm: 'quote-request' as const,
          pipelineStage: mapStage(f.Stage), estimatedValue: num(f['Deal Value']),
          message: f.Notes || undefined,
          payload: { mondaySource: 'deals', mondayItemId: it.id, ...f },
        }
  if (!WRITE) { created++; return }
  try {
    await payload.create({ collection: 'leads', data: data as any, overrideAccess: true, context: { skipRouting: true } })
    seen.add(it.id); created++
  } catch (e) {
    failed++
    console.warn(`skip ${source} "${f.name}": ${(e as Error).message.slice(0, 80)}`)
  }
}

for (const it of contactsB ? await pullAll(contactsB.id) : []) await importItem(it, 'contacts')
for (const it of dealsB ? await pullAll(dealsB.id) : []) await importItem(it, 'deals')

console.log(`\n${WRITE ? 'CREATED' : 'WOULD CREATE'}: ${created} leads · skipped (already imported): ${skipped} · failed: ${failed}`)
if (!WRITE) console.log('This was a DRY PREVIEW. Re-run with --write to import.')
process.exit(0)
