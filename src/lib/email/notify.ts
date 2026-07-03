import type { Payload } from 'payload'
import { org } from '@/lib/site'
import { getFormConfig, type FormType } from '@/lib/forms/config'

// Builds + sends the lead notification to the four p5400.com inboxes via the
// Payload email adapter (Resend in prod; console in dev). Emergency submissions
// get the [EMERGENCY] subject prefix (task 2.1).
export async function sendLeadNotification(
  payload: Payload,
  input: {
    type: FormType
    data: Record<string, string>
    pageSource?: string
    photoCount?: number
    utm?: Record<string, string>
  },
): Promise<void> {
  const config = getFormConfig(input.type)
  const prefix = config.emailSubjectPrefix ?? ''
  const who = input.data.name || input.data.email || 'Unknown'
  const subject = `${prefix}New ${config.title} — ${who}`

  const rows = Object.entries(input.data)
    .filter(([k]) => k !== 'company_website')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5C7078">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v || '—')}</strong></td></tr>`)
    .join('')

  const html = `
    <div style="font-family:Arial,sans-serif;color:#16303B">
      <h2 style="color:#00415A">${escapeHtml(config.title)} submission</h2>
      <table style="border-collapse:collapse;font-size:14px">${rows}</table>
      ${input.photoCount ? `<p>📎 ${input.photoCount} photo(s) attached to the CMS record.</p>` : ''}
      <p style="color:#5C7078;font-size:12px">Page: ${escapeHtml(input.pageSource || '—')}${
        input.utm && Object.keys(input.utm).length ? ` · UTM: ${escapeHtml(JSON.stringify(input.utm))}` : ''
      }</p>
      <p style="color:#5C7078;font-size:12px">View & export in the CMS under Leads → Form Submissions.</p>
    </div>`

  await payload.sendEmail({
    to: org.email_leads,
    subject,
    html,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
