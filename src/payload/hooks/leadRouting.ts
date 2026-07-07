/* Lead routing — the "email forms operator" (UI-2 §3).
 * On lead CREATE: batch-email all enabled LeadRouting recipients via Twilio using the
 * form-lead-internal template (replyTo = submitter), acknowledge the submitter with
 * form-lead-ack, persist the operation id + per-recipient delivery, and append activity.
 *
 * The lead row is already persisted before this runs (afterChange), so a failed send
 * never loses a lead — routing is best-effort and never throws. */
import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail, getOperationStatus, type SendResult } from '@/lib/email/twilio'
import { renderTemplate } from '@/lib/email/render'
import { TEMPLATES } from '@/lib/email/templates'
import { getRecipients, SENDERS } from '@/lib/email/recipients'
import nap from '../../../data/nap.json'

type AnyLead = Record<string, any>

const SOURCE_LABEL: Record<string, string> = {
  contact: 'Contact',
  'quote-request': 'Quote Request',
  emergency: 'Emergency Service',
  'phone-in': 'Phone-in',
  manual: 'Manual',
}

function internalFields(lead: AnyLead): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  if (lead.email) rows.push({ label: 'Email', value: String(lead.email) })
  if (lead.phone) rows.push({ label: 'Phone', value: String(lead.phone) })
  if (lead.company) rows.push({ label: 'Company', value: String(lead.company) })
  rows.push({ label: 'Source form', value: SOURCE_LABEL[lead.sourceForm] || String(lead.sourceForm || 'Contact') })
  if (lead.estimatedValue) rows.push({ label: 'Est. value', value: `$${Number(lead.estimatedValue).toLocaleString('en-US')}` })
  // Surface any extra scalar fields captured in the original payload — but never the anti-spam
  // artifacts (Turnstile token, honeypot) or noisy internals; they aren't lead data.
  const seen = new Set(['name', 'email', 'phone', 'company', 'message', 'cf-turnstile-response', 'company_website', 'photoIds', 'photoCount'])
  for (const [k, v] of Object.entries(lead.payload || {})) {
    if (seen.has(k) || v == null || typeof v === 'object') continue
    rows.push({ label: k.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), value: String(v) })
  }
  return rows
}

/** Route a freshly-created lead. Best-effort; resolves even on failure. */
export async function routeLead(payload: any, lead: AnyLead, req?: any): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://centrifuge.com'
  const from = { address: SENDERS.notifications, name: 'Centrifuge World' }
  const isEmergency = lead.sourceForm === 'emergency'
  const emergencyDisplay = nap.phones.emergency.display
  // Phase 3: inventory-sourced leads carry a machine snapshot in the payload — surface it in
  // the internal alert (block + subject). specsLine is precomputed (Liquid can't join arrays).
  const rawMachine = lead.payload && typeof lead.payload === 'object' ? (lead.payload as AnyLead).machine : null
  const machine = rawMachine
    ? { ...rawMachine, specsLine: (rawMachine.specsSnapshot || []).slice(0, 3).map((s: AnyLead) => `${s.label}: ${s.value}`).join(' · ') }
    : null
  // Photos the submitter uploaded (absolute urls captured at submit time) → shown in the alert.
  const photos = lead.payload && typeof lead.payload === 'object' ? (lead.payload as AnyLead).photoUrls || null : null
  const activity: any[] = [{ type: 'form_received', note: 'Payload validated, lead created', at: new Date().toISOString(), by: 'system' }]
  const patch: AnyLead = {}

  try {
    const recipients = await getRecipients(payload, req)
    if (!recipients.length) throw new Error('No routing recipients configured')

    // 1) Internal batch alert to all recipients.
    const internal = await renderTemplate(TEMPLATES['form-lead-internal'], {
      isEmergency,
      formTypeLabel: SOURCE_LABEL[lead.sourceForm] || 'New Lead',
      name: lead.name,
      company: lead.company,
      receivedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      fields: internalFields(lead),
      message: lead.message,
      machine,
      photos,
      leadUrl: `${siteUrl}/admin/collections/leads/${lead.id}`,
      emergencyDisplay,
    })
    const subjectName = lead.name || 'New lead'
    const subject = machine
      ? `Quote request — ${machine.title} (${machine.inventoryId})`
      : `${isEmergency ? '🔴 EMERGENCY: ' : ''}[${SOURCE_LABEL[lead.sourceForm] || 'Lead'}] ${subjectName}${lead.company ? ` — ${lead.company}` : ''}`
    const res: SendResult = await sendEmail({
      from,
      to: recipients.map((r) => ({ address: r.email, name: r.name })),
      subject,
      html: internal.html,
      text: internal.text,
      replyTo: lead.email || undefined,
    })
    patch.twilioOperationId = res.operationId
    activity.push({ type: 'routed', note: `Batch send accepted (${res.recipients.length} recipients, op ${res.operationId})`, at: new Date().toISOString(), by: 'system' })

    // 2) Resolve per-recipient delivery from the operation (dry-run resolves COMPLETED).
    let delivered = false
    if (res.operationId) {
      try {
        const status = await getOperationStatus(res.operationId)
        delivered = status.status === 'COMPLETED' && !(status.stats?.failed > 0)
      } catch {
        /* leave queued; a later poll/cron can resolve */
      }
    }
    patch.delivery = recipients.map((r) => ({
      recipient: r.email,
      status: delivered ? 'delivered' : 'queued',
      timestamp: new Date().toISOString(),
    }))

    // 3) Acknowledge the submitter.
    if (lead.email) {
      const ack = await renderTemplate(TEMPLATES['form-lead-ack'], {
        name: lead.name,
        hoursDisplay: nap.hours.office.display,
        oncallDisplay: nap.hours.oncall.display,
        phoneDisplay: nap.phones.main.display,
        emergencyDisplay,
      })
      await sendEmail({ from, to: [lead.email], subject: 'We received your request — Centrifuge World', html: ack.html, text: ack.text })
      activity.push({ type: 'acknowledged', note: 'Acknowledgement sent to submitter', at: new Date().toISOString(), by: 'system' })
    }
  } catch (err) {
    activity.push({ type: 'route_failed', note: `Routing error: ${(err as Error).message}`.slice(0, 240), at: new Date().toISOString(), by: 'system' })
    // eslint-disable-next-line no-console
    console.error('[leadRouting] routing failed for lead', lead.id, err)
  }

  // Persist operation id, delivery, and activity. This update re-enters afterChange with
  // operation 'update', which is a no-op here, so there is no recursion.
  try {
    await payload.update({
      collection: 'leads',
      id: lead.id,
      data: { ...patch, activity: [...(lead.activity || []), ...activity] },
      overrideAccess: true,
      req,
      context: { skipRouting: true },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[leadRouting] failed to persist routing result for lead', lead.id, err)
  }
}

export const leadAfterChange: CollectionAfterChangeHook = async ({ doc, operation, req, context }) => {
  if (operation !== 'create') return doc
  if (context?.skipRouting) return doc
  // Fire-and-forget within the request; awaited so serverless doesn't drop it.
  await routeLead(req.payload, doc as AnyLead, req)
  return doc
}
