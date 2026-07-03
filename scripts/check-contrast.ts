// CI gate (task 1.3): asserts WCAG AA for every defined text/background pair.
// Exits non-zero on any failure so the build fails below budget.
import { evaluate } from './contrast-pairs'

const results = evaluate()
let failed = 0

console.log('\nWCAG AA contrast check — Industrial Blue palette\n')
console.log('  ratio   req   lvl     pair')
console.log('  ' + '─'.repeat(60))
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) failed++
  console.log(
    `  ${mark} ${r.ratio.toFixed(2).padStart(5)}  ${r.required.toFixed(1)}  ${r.level.padEnd(6)}  ${r.name}`,
  )
}
console.log('  ' + '─'.repeat(60))

if (failed > 0) {
  console.error(`\n✗ ${failed} pair(s) fail WCAG AA. Adjust tokens in src/styles/tokens.css.\n`)
  process.exit(1)
}
console.log(`\n✓ All ${results.length} pairs pass WCAG AA.\n`)
