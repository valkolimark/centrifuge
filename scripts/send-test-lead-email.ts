/* Send the sample new-lead emails (quote with photos, emergency, inventory machine) to ONE
 * address for review — subjects prefixed [TEST]. No DB, no leads created. Needs Twilio creds,
 * so run it with production env:
 *   vercel env run -e production -- pnpm tsx scripts/send-test-lead-email.ts mark@p5400.com
 * Sample photos are real public inventory images, so View/Download links can be clicked. */
import { sendEmail, isDryRun } from '../src/lib/email/twilio'
import { renderTemplate } from '../src/lib/email/render'
import { TEMPLATES } from '../src/lib/email/templates'
import { buildLeadEmail } from '../src/lib/email/lead-view'
import { blobPublicUrl } from '../src/lib/blob-url'
import { SENDERS } from '../src/lib/email/recipients'
import { SAMPLE_LEADS, CTX } from '../src/lib/email/__fixtures__/leads'
import nap from '../data/nap.json'

const to = process.argv[2]
if (!to || !/^[^@\s]+@[^@\s]+$/.test(to)) {
  console.error('Usage: pnpm tsx scripts/send-test-lead-email.ts <one-email-address>')
  process.exit(1)
}
// This script exists to send; force real mode (still requires Twilio credentials).
process.env.LEADS_EMAIL_DRY_RUN = 'false'
if (isDryRun()) {
  console.error('No Twilio credentials in env. Run via: vercel env run -e production -- pnpm tsx scripts/send-test-lead-email.ts ' + to)
  process.exit(1)
}

const photo = (file: string, name: string, size: number) => {
  const url = blobPublicUrl(file)
  return { url, thumb: url, name, size }
}
const quote = SAMPLE_LEADS.quote
const leads = {
  quote: {
    ...quote,
    payload: {
      ...quote.payload,
      photoUrls: [photo('207050.jpg', 'scroll-flights.jpg', 22191), photo('207050_2.jpg', 'bearing-housing.jpg', 23469), photo('79229.jpg', 'nameplate.jpg', 23517)],
    },
  },
  emergency: SAMPLE_LEADS.emergency,
  machine: SAMPLE_LEADS.machine,
}

const ctx = { ...CTX, emergencyDisplay: nap.phones.emergency.display, hoursDisplay: nap.hours.office.display, oncallDisplay: nap.hours.oncall.display, now: new Date() }
for (const [key, lead] of Object.entries(leads)) {
  const { view, subject } = buildLeadEmail(lead, ctx)
  const { html, text } = await renderTemplate(TEMPLATES['form-lead-internal'], view)
  const res = await sendEmail({ from: { address: SENDERS.notifications, name: 'Centrifuge World' }, to: [to], subject: `[TEST] ${subject}`, html, text })
  console.log(`${key.padEnd(10)} sent → ${to} (op ${res.operationId})`)
}
