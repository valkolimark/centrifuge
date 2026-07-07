/* Backfill the readable `details` on existing form-submissions and the `message` on
 * form-created leads, from their stored `payload`. New submissions already get this at
 * write time; this catches records created before the fix. Imported Monday leads are skipped.
 *
 * Run: pnpm tsx scripts/backfill-form-details.ts            (dry preview)
 *      pnpm tsx scripts/backfill-form-details.ts --write     (apply)
 */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const WRITE = process.argv.includes('--write')
const { EQUIPMENT_OPTIONS, BRAND_OPTIONS, URGENCY_OPTIONS, CONDITION_OPTIONS } = await import('@/lib/forms/config')
const { getPayloadClient } = await import('@/lib/payload')

const optLabel = (opts: readonly { value: string; label: string }[], v?: string) =>
  (v && opts.find((o) => o.value === v)?.label) || v

// Mirror of submit-form.ts composeDetails.
function composeDetails(data: Record<string, any>, photoCount: number): string {
  const rows: Array<[string, string | undefined]> = [
    ['Location', data.location],
    ['Equipment', optLabel(EQUIPMENT_OPTIONS, data.equipment)],
    ['Brand', optLabel(BRAND_OPTIONS, data.brand)],
    ['Model', data.model],
    ['Service needed', data.serviceNeeded],
    ['Urgency', optLabel(URGENCY_OPTIONS, data.urgency)],
    ['Condition', optLabel(CONDITION_OPTIONS, data.condition)],
    ['Asking price', data.askingPrice],
  ]
  const lines = rows.filter(([, v]) => v && String(v).trim()).map(([k, v]) => `${k}: ${v}`)
  if (photoCount) lines.push(`Photos attached: ${photoCount}`)
  const details = lines.join('\n')
  const free = typeof data.message === 'string' ? data.message.trim() : ''
  return [details, free].filter(Boolean).join('\n\n')
}

const p = await getPayloadClient()

let subUpdated = 0
const subs = await p.find({ collection: 'form-submissions', limit: 2000, depth: 0, overrideAccess: true })
for (const s of subs.docs as any[]) {
  const pl = s.payload || {}
  const details = composeDetails(pl, Number(pl.photoCount) || 0)
  if (details && details !== s.details) {
    subUpdated++
    if (WRITE) await p.update({ collection: 'form-submissions', id: s.id, data: { details }, overrideAccess: true })
  }
}

let leadUpdated = 0
const leads = await p.find({ collection: 'leads', limit: 10000, depth: 0, overrideAccess: true })
for (const l of leads.docs as any[]) {
  const pl = l.payload || {}
  if (pl.mondayItemId) continue // skip imported CRM leads
  const details = composeDetails(pl, Number(pl.photoCount) || 0)
  if (details && details !== l.message) {
    leadUpdated++
    if (WRITE) await p.update({ collection: 'leads', id: l.id, data: { message: details }, overrideAccess: true, context: { skipRouting: true } as any })
  }
}

console.log(`\n${WRITE ? 'UPDATED' : 'WOULD UPDATE'} — form-submissions: ${subUpdated} · form leads: ${leadUpdated}`)
if (!WRITE) console.log('DRY — re-run with --write to apply.')
process.exit(0)
