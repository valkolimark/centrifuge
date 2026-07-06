/* Fix leads[].company: it was imported from Monday's "Company" dropdown (our internal handling
 * entity — Centrifuge World / Mixer Works / Gear World), not the client. The real client is the
 * linked "Accounts" column. Re-pull Deals + Contacts, read the account via display_value, and
 * update each lead (matched by payload.mondayItemId) in place — no re-import.
 *
 * Run: pnpm tsx scripts/fix-lead-companies.ts           (dry preview)
 *      pnpm tsx scripts/fix-lead-companies.ts --write    (apply updates)
 */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const WRITE = process.argv.includes('--write')
const { listBoards, getBoardItems, itemFields, firstLinked } = await import('@/lib/monday/client')
const { getPayloadClient } = await import('@/lib/payload')

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

// mondayItemId -> corrected client company (from Accounts). undefined = no account linked.
const byItem = new Map<string, string | undefined>()
for (const name of ['Contacts', 'Deals']) {
  const b = find(name)
  if (!b) continue
  for (const it of await pullAll(b.id)) {
    const f = itemFields(it)
    byItem.set(String(it.id), firstLinked(f.Accounts))
  }
}
console.log(`Pulled ${byItem.size} Monday items (with Accounts display_value).`)

const leads = await payload.find({ collection: 'leads', limit: 10000, depth: 0, overrideAccess: true })
console.log(`Scanning ${leads.totalDocs} leads…\n`)

let fixed = 0, cleared = 0, unchanged = 0, noMatch = 0
const samples: string[] = []
for (const lead of leads.docs as any[]) {
  const mid = lead.payload?.mondayItemId ? String(lead.payload.mondayItemId) : null
  if (!mid || !byItem.has(mid)) { noMatch++; continue }
  const correct = byItem.get(mid) || null // null clears the wrong internal-entity value
  if ((lead.company || null) === correct) { unchanged++; continue }
  if (samples.length < 15) samples.push(`  ${JSON.stringify(lead.company)}  →  ${JSON.stringify(correct)}   (${lead.name})`)
  if (correct) fixed++; else cleared++
  if (WRITE) {
    await payload.update({ collection: 'leads', id: lead.id, data: { company: correct }, overrideAccess: true, context: { skipRouting: true } as any })
  }
}

console.log('sample changes:')
console.log(samples.join('\n'))
console.log(`\n${WRITE ? 'UPDATED' : 'WOULD UPDATE'} — set to account: ${fixed} · cleared (no account): ${cleared} · unchanged: ${unchanged} · no monday match: ${noMatch}`)
if (!WRITE) console.log('DRY PREVIEW — re-run with --write to apply.')
process.exit(0)
