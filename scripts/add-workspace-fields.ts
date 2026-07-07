/* Additively add the new workspace columns to the shared Neon DB WITHOUT a schema push (a push
 * would also destructively drop users.login_attempts/lock_until — see the prebuild guard).
 * Adds: quotes.reference_number, quotes.description, leads.notes — all nullable text, IF NOT
 * EXISTS (idempotent, non-destructive). Payload maps text/textarea fields to varchar.
 *
 * Run: pnpm tsx scripts/add-workspace-fields.ts            (inspect only)
 *      pnpm tsx scripts/add-workspace-fields.ts --write     (apply ALTERs)
 */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const WRITE = process.argv.includes('--write')
const { getPayloadClient } = await import('@/lib/payload')
const payload = await getPayloadClient()
const pool = (payload.db as any).pool as { query: (q: string) => Promise<{ rows: any[] }> }

async function cols(table: string) {
  const { rows } = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${table}' ORDER BY ordinal_position`,
  )
  return rows as { column_name: string; data_type: string }[]
}

for (const t of ['quotes', 'leads']) {
  const c = await cols(t)
  console.log(`\n=== ${t} (${c.length} cols) ===`)
  console.log(c.map((r) => `${r.column_name}:${r.data_type}`).join(', '))
}

// Versioned collections (Quotes: drafts, Leads: versions) keep a parallel _<name>_v table with
// version_-prefixed columns — the new fields must be added there too or inserts fail.
const ADDS: { table: string; column: string }[] = [
  { table: 'quotes', column: 'reference_number' },
  { table: 'quotes', column: 'description' },
  { table: 'leads', column: 'notes' },
  { table: '_quotes_v', column: 'version_reference_number' },
  { table: '_quotes_v', column: 'version_description' },
  { table: '_leads_v', column: 'version_notes' },
  { table: 'form_submissions', column: 'details' },
]

async function tableExists(t: string) {
  const { rows } = await pool.query(`SELECT to_regclass('public.${t}') AS t`)
  return !!rows[0]?.t
}

console.log(`\n=== ${WRITE ? 'APPLYING' : 'WOULD APPLY'} ===`)
for (const { table, column } of ADDS) {
  if (!(await tableExists(table))) { console.log(`  skip ${table}.${column} (table absent)`); continue }
  const sql = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} varchar`
  console.log('  ' + sql)
  if (WRITE) await pool.query(sql)
}

if (WRITE) {
  console.log('\nDone. New columns:')
  for (const t of ['quotes', 'leads']) {
    const c = await cols(t)
    console.log(`  ${t}: ${c.filter((r) => ['reference_number', 'description', 'notes'].includes(r.column_name)).map((r) => `${r.column_name}:${r.data_type}`).join(', ') || '(none new)'}`)
  }
} else {
  console.log('\nDRY — re-run with --write to apply.')
}
process.exit(0)
