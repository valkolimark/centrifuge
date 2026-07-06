/* Quote create + send flow (UI-2 §5). Creating retries on the unique quoteNumber index so
 * concurrent creates stay unique (acceptance #4). Sending: render PDF from the shared
 * QuoteDocument, upload it, append an IMMUTABLE snapshot (version, pdf, sha256), email the
 * client via quotes@ (PDF attached, link-only fallback over 10MB, CC the team), and move
 * the quote → sent / lead → quote-sent. */
import { toQuoteView } from './view'
import { renderQuotePdf, quotePdfFilename } from './pdf'
import { sendEmail, EmailTooLargeError } from '@/lib/email/twilio'
import { renderTemplate } from '@/lib/email/render'
import { TEMPLATES } from '@/lib/email/templates'
import { getRecipients, SENDERS } from '@/lib/email/recipients'

type AnyQuote = Record<string, any>

/** Create a quote, retrying if the generated number collides under concurrency. */
export async function createQuote(payload: any, data: AnyQuote, req?: any, attempts = 5): Promise<AnyQuote> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await payload.create({ collection: 'quotes', data, overrideAccess: true, req })
    } catch (err: any) {
      const msg = String(err?.message || '')
      const dupe = /unique|duplicate|quoteNumber/i.test(msg)
      if (dupe && i < attempts - 1) continue // regenerate number on next attempt (beforeValidate)
      throw err
    }
  }
  throw new Error('createQuote: exhausted retries')
}

export type SendQuoteResult = {
  version: number
  operationId: string | null
  pdfAttached: boolean
  bytes: number
  dryRun: boolean
}

export async function sendQuote(
  payload: any,
  quoteId: string | number,
  // testEmail: send ONLY to that address (a test-to-self), skipping the client/team send,
  // the immutable snapshot, and the status/lead transitions — nothing is committed.
  opts: { ownerEmail?: string; testEmail?: string; req?: any } = {},
): Promise<SendQuoteResult> {
  const req = opts.req
  const quote: AnyQuote = await payload.findByID({ collection: 'quotes', id: quoteId, depth: 0, req })
  if (!quote) throw new Error(`Quote ${quoteId} not found`)
  if (!opts.testEmail && !quote.client?.email) throw new Error('Quote has no client email')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://centrifuge.com'
  const now = new Date()
  const validUntil = new Date(now)
  validUntil.setDate(validUntil.getDate() + (Number(quote.validDays) || 30))

  // Same component/data the client will see — snapshot what we send.
  const view = toQuoteView({ ...quote, sentAt: now.toISOString(), validUntil: validUntil.toISOString() })
  const { pdf, htmlHash, bytes } = await renderQuotePdf(view)

  const version = (quote.sentSnapshots?.length || 0) + 1
  const filename = quotePdfFilename(quote.quoteNumber, version)

  // Store the PDF (best-effort — link-only email still works if storage is unavailable).
  let pdfMediaId: string | number | null = null
  try {
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Quote ${quote.quoteNumber} v${version}` },
      file: { data: pdf, mimetype: 'application/pdf', name: filename, size: pdf.length },
      overrideAccess: true,
      req,
    })
    pdfMediaId = media.id
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendQuote] PDF storage failed; sending link-only', err)
  }

  const recipients = await getRecipients(payload, req)
  const viewUrl = `${siteUrl}/quote/${quote.viewToken}`
  const from = { address: SENDERS.quotes, name: 'Centrifuge World' }
  const attachment = { filename, content: pdf.toString('base64'), type: 'application/pdf' }

  const emailVars = {
    quoteNumber: quote.quoteNumber,
    scopeTitle: quote.scopeTitle,
    clientName: quote.client?.contactName,
    clientCompany: quote.client?.company,
    total: view.total,
    validUntil: view.validUntil,
    viewUrl,
    emergencyDisplay: view.emergencyDisplay,
  }

  // Test-to-self: mail the rendered quote to one address only and return. No CC, no snapshot,
  // no status/lead change — this is a preview send, nothing about the quote is committed.
  if (opts.testEmail) {
    const { html, text } = await renderTemplate(TEMPLATES['quote-delivery'], { ...emailVars, hasPdf: true })
    const res = await sendEmail({
      from,
      to: [{ address: opts.testEmail, name: 'Test recipient' }],
      replyTo: opts.ownerEmail || SENDERS.quotes,
      subject: `[TEST] Quote ${quote.quoteNumber} — Centrifuge World`,
      html,
      text,
      attachments: [attachment],
    })
    return { version: 0, operationId: res.operationId, pdfAttached: true, bytes: pdf.length, dryRun: res.dryRun }
  }

  // Try with the PDF attached; fall back to link-only if over the 10MB limit.
  const sendWith = async (withPdf: boolean) => {
    const { html, text } = await renderTemplate(TEMPLATES['quote-delivery'], { ...emailVars, hasPdf: withPdf })
    return sendEmail({
      from,
      to: [{ address: quote.client.email, name: quote.client.contactName }],
      cc: recipients.map((r) => r.email),
      replyTo: opts.ownerEmail || SENDERS.quotes,
      subject: `Quote ${quote.quoteNumber} — Centrifuge World`,
      html,
      text,
      ...(withPdf ? { attachments: [attachment] } : {}),
    })
  }

  let pdfAttached = true
  let res
  try {
    res = await sendWith(true)
  } catch (err) {
    if (err instanceof EmailTooLargeError) {
      pdfAttached = false
      res = await sendWith(false) // link-only
    } else {
      throw err
    }
  }

  const recipientStatus = [
    { recipient: quote.client.email, status: 'queued' },
    ...recipients.map((r) => ({ recipient: r.email, status: 'queued(cc)' })),
  ]

  // Append the immutable snapshot + flip status. The collection's beforeChange hook allows
  // appends but rejects edits/removals of prior snapshots.
  await payload.update({
    collection: 'quotes',
    id: quoteId,
    data: {
      status: 'sent',
      validUntil: validUntil.toISOString(),
      sentSnapshots: [
        ...(quote.sentSnapshots || []),
        { version, sentAt: now.toISOString(), pdf: pdfMediaId, docData: view, htmlHash, twilioOperationId: res.operationId, recipientStatus },
      ],
    },
    overrideAccess: true,
    req,
  })

  // Move the linked lead to Quote Sent.
  if (quote.lead) {
    try {
      const leadId = typeof quote.lead === 'object' ? quote.lead.id : quote.lead
      await payload.update({ collection: 'leads', id: leadId, data: { pipelineStage: 'quote-sent' }, overrideAccess: true, req })
    } catch {
      /* non-fatal */
    }
  }

  return { version, operationId: res.operationId, pdfAttached, bytes, dryRun: res.dryRun }
}
