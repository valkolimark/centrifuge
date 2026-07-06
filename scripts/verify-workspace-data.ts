/* Read-only check of the Leads & Quotes workspace read model against the live DB.
 * Dumps pipeline distribution, KPIs, and sample rows so we can confirm getWorkspaceData()
 * returns correct real data before the admin UI renders it.
 *
 * Run: pnpm tsx scripts/verify-workspace-data.ts   (reads .env.local; no writes)
 */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const { getWorkspaceData } = await import('@/lib/leads-quotes/workspace')

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

const data = await getWorkspaceData()

console.log('\n=== TOTALS ===')
console.log(`leads: ${data.totals.leads}   quotes: ${data.totals.quotes}`)

console.log('\n=== PIPELINE (by stage) ===')
let boardLeads = 0
for (const c of data.pipeline) {
  boardLeads += c.count
  console.log(`  ${c.label.padEnd(12)} ${String(c.count).padStart(4)} leads   ${usd(c.valueSum).padStart(12)}`)
}
console.log(`  ${'TOTAL'.padEnd(12)} ${String(boardLeads).padStart(4)} leads (should equal ${data.totals.leads})`)

console.log('\n=== KPIs ===')
console.log(`  new leads (7d):      ${data.kpis.newLeads7d}`)
console.log(`  open quote value:    ${usd(data.kpis.openQuoteValue)} across ${data.kpis.openQuoteCount} quotes`)
console.log(`  accepted 90d value:  ${usd(data.kpis.acceptedValue90d)}`)
console.log(`  win rate 90d:        ${data.kpis.winRate90d === null ? 'n/a' : data.kpis.winRate90d + '%'}`)
console.log(`  expiring soon (<7d): ${data.kpis.expiringSoon}`)

console.log('\n=== SAMPLE PIPELINE CARDS (first non-empty stage) ===')
const firstFull = data.pipeline.find((c) => c.leads.length)
for (const l of (firstFull?.leads || []).slice(0, 5)) {
  console.log(`  ${l.name} · ${l.company} · ${l.source} · ${l.estimatedValue ? usd(l.estimatedValue) : '—'} · ${l.ageLabel}${l.quoteNumber ? ' · ' + l.quoteNumber : ''}`)
}

console.log('\n=== SAMPLE FORM LEADS ===')
for (const f of data.formLeads.slice(0, 5)) {
  console.log(`  ${f.name} · ${f.company} · ${f.source} · routed to ${f.delivery.length} · ${f.pipelineLabel}`)
}

console.log('\n=== SAMPLE QUOTES ===')
for (const q of data.quotes.slice(0, 5)) {
  console.log(`  ${q.quoteNumber} · ${q.clientCompany} · ${usd(q.total)} · ${q.status} · ${q.year}`)
}

console.log('\nOK — read model returned without error.\n')
process.exit(0)
