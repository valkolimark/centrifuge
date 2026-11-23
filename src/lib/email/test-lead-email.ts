/* Send the sample new-lead emails (quote with photos, emergency, inventory machine) to one
 * address, subjects prefixed [TEST]. No DB writes, no leads created. Used by the admin route
 * /api/admin/test-lead-email (production has the Twilio creds) and scripts/send-test-lead-email.ts. */
import { sendEmail, transport } from './twilio'
import { renderTemplate } from './render'
import { TEMPLATES } from './templates'
import { buildLeadEmail } from './lead-view'
import { SENDERS } from './recipients'
import { blobPublicUrl } from '@/lib/blob-url'
import { SAMPLE_LEADS, CTX } from './__fixtures__/leads'
import nap from '../../../data/nap.json'

// Real public inventory images, so the sample's View/Download links can be clicked.
const photo = (file: string, name: string, size: number) => {
  const url = blobPublicUrl(file)
  return { url, thumb: url, name, size }
}

export async function sendTestLeadEmails(to: string, siteUrl = CTX.siteUrl) {
  const quote = SAMPLE_LEADS.quote
  const leads = {
    quote: {
      ...quote,
      payload: {
        ...quote.payload,
        photoUrls: [photo('207050.jpg', 'scroll-flights.jpg', 22191), photo('207050_2.jpg', 'bearing-housing.jpg', 23469), photo('79229.jpg', 'nameplate.jpg', 23517)].filter((p) => p.url),
      },
    },
    emergency: SAMPLE_LEADS.emergency,
    machine: SAMPLE_LEADS.machine,
  }
  const ctx = { ...CTX, siteUrl, emergencyDisplay: nap.phones.emergency.display, hoursDisplay: nap.hours.office.display, oncallDisplay: nap.hours.oncall.display, now: new Date() }

  const results: Array<{ sample: string; subject: string; replyTo: string | null; transport: string; operationId: string | null; dryRun: boolean }> = []
  for (const [sample, lead] of Object.entries(leads)) {
    const { view, subject } = buildLeadEmail(lead, ctx)
    const { html, text } = await renderTemplate(TEMPLATES['form-lead-internal'], view)
    // Same reply-to as a real lead (the customer), so hitting Reply shows where it would go.
    const replyTo = (lead as Record<string, any>).email || undefined
    const res = await sendEmail({ from: { address: SENDERS.notifications, name: 'Centrifuge World' }, to: [to], subject: `[TEST] ${subject}`, html, text, replyTo })
    results.push({ sample, subject: `[TEST] ${subject}`, replyTo: replyTo ?? null, transport: transport(), operationId: res.operationId, dryRun: res.dryRun })
  }
  return results
}
