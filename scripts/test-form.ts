// Exercises the forms-engine pipeline end-to-end against the real DB:
// validate → store in form-submissions → send notification (console in dev).
// Not a CI test — a manual smoke check. Run: pnpm tsx scripts/test-form.ts
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function loadEnv() {
  const file = resolve(root, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
}

async function main() {
  loadEnv()
  const { validateSubmission } = await import('../src/lib/forms/schema.ts')
  const { sendLeadNotification } = await import('../src/lib/email/notify.ts')
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })

  const sample = {
    name: 'Test Plant Manager',
    company: 'Acme Rendering',
    email: 'test@example.com',
    phone: '(800) 555-0100',
    location: 'Houston, TX',
    equipment: 'decanter',
    brand: 'sharples',
    model: 'P3400',
    serviceNeeded: 'Rebuild',
    urgency: 'this-week',
    message: 'Vibration and bearing noise on our decanter.',
    company_website: '', // honeypot empty
  }

  const result = validateSubmission('request_quote', sample)
  console.log('validate:', result.ok ? 'OK' : result.errors)
  if (!result.ok || !result.data) process.exit(1)

  const before = await payload.count({ collection: 'form-submissions' })
  const created = await payload.create({
    collection: 'form-submissions',
    data: {
      type: 'request_quote',
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      company: result.data.company,
      pageSource: '/request-a-quote/ (smoke test)',
      payload: result.data,
    },
  })
  const after = await payload.count({ collection: 'form-submissions' })
  console.log(`stored submission id=${created.id}; count ${before.totalDocs} → ${after.totalDocs}`)

  await sendLeadNotification(payload, {
    type: 'request_quote',
    data: result.data,
    pageSource: '/request-a-quote/ (smoke test)',
  })
  console.log('notification dispatched (console adapter in dev)')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
