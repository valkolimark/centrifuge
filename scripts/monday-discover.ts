/* Discovery: lists your monday.com boards + columns so we can map "contacts" and
   "current jobs" to the workspace. Run after MONDAY_API_TOKEN is in .env.local:
   pnpm tsx scripts/monday-discover.ts */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const { listBoards, getBoardItems, itemFields } = await import('@/lib/monday/client')

const boards = await listBoards()
if (!boards.length) {
  console.log('No boards returned. Is MONDAY_API_TOKEN set and valid?')
  process.exit(0)
}
console.log(`\n${boards.length} boards:\n`)
for (const b of boards) {
  console.log(`• ${b.name}  (id ${b.id}, ${b.items_count} items)`)
  console.log(`    columns: ${b.columns.map((c) => `${c.title}[${c.type}]`).join(', ')}`)
}
// Sample the first few items from each board that looks like contacts/jobs.
for (const b of boards) {
  if (!/contact|lead|job|deal|client|customer|project|quote/i.test(b.name)) continue
  const { items } = await getBoardItems(b.id, 3)
  console.log(`\n── sample from "${b.name}" ──`)
  for (const it of items) console.log('  ', JSON.stringify(itemFields(it)))
}
process.exit(0)
