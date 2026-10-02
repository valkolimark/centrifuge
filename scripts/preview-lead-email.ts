/* Render the new-lead email for each sample lead to HTML + text files — no send, no DB.
 *   pnpm tsx scripts/preview-lead-email.ts [outDir]   (default: .email-preview/) */
import fs from 'node:fs'
import path from 'node:path'
import { renderTemplate } from '../src/lib/email/render'
import { TEMPLATES } from '../src/lib/email/templates'
import { buildLeadEmail } from '../src/lib/email/lead-view'
import { SAMPLE_LEADS, CTX } from '../src/lib/email/__fixtures__/leads'

const outDir = path.resolve(process.argv[2] || '.email-preview')
fs.mkdirSync(outDir, { recursive: true })
for (const [key, lead] of Object.entries(SAMPLE_LEADS)) {
  const { view, subject } = buildLeadEmail(lead, CTX)
  const { html, text } = await renderTemplate(TEMPLATES['form-lead-internal'], view)
  fs.writeFileSync(path.join(outDir, `${key}.html`), html)
  fs.writeFileSync(path.join(outDir, `${key}.txt`), `Subject: ${subject}\n\n${text}`)
  console.log(`${key.padEnd(10)} ${subject}`)
}
console.log(`\nWrote ${Object.keys(SAMPLE_LEADS).length} previews to ${outDir}`)
