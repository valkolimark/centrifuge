/* View model for the internal new-lead email (form-lead-internal). Pure: turns a lead row
 * into labeled, display-ready sections + a subject line, so the Liquid template only lays
 * things out. Raw option slugs (decanter, this-week, alfa-laval) become human labels here. */
import { EQUIPMENT_OPTIONS, BRAND_OPTIONS, URGENCY_OPTIONS, CONDITION_OPTIONS } from '@/lib/forms/config'

type AnyLead = Record<string, any>
type Opt = readonly { value: string; label: string }[]

// Public form type → label. Older leads predate payload.formType, so fall back to sourceForm.
const FORM_LABEL: Record<string, string> = {
  request_quote: 'Quote Request',
  emergency_service: 'Emergency Service',
  free_inspection: 'Free Inspection',
  sell_centrifuge: 'Sell Your Centrifuge',
  contact: 'Contact',
  send_photos: 'Send Photos',
}
const SOURCE_LABEL: Record<string, string> = {
  contact: 'Contact',
  'quote-request': 'Quote Request',
  emergency: 'Emergency Service',
  'phone-in': 'Phone-in',
  manual: 'Manual',
}

// Urgency → chip tone in the email (crit = red, warn = amber, ok = green).
const URGENCY_TONE: Record<string, string> = { emergency: 'crit', 'this-week': 'warn', planning: 'ok' }

// Payload keys rendered in a dedicated spot, or never shown (anti-spam artifacts, internals).
const HANDLED = new Set([
  'name', 'email', 'phone', 'company', 'location', 'message', 'whatHappened',
  'equipment', 'brand', 'model', 'serviceNeeded', 'urgency', 'condition', 'askingPrice',
  'formType', 'pageSource', 'source', 'machine', 'utm',
  'photoIds', 'photoCount', 'photoUrls',
  'cf-turnstile-response', 'company_website', 'contact_time',
])

const optLabel = (opts: Opt, v?: unknown) => {
  const s = v == null ? '' : String(v).trim()
  return (s && opts.find((o) => o.value === s)?.label) || s
}
const titleCase = (k: string) =>
  k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** "(281) 555-0142" → "+12815550142"; leaves anything non-NANP as bare digits. */
export function telHref(phone?: string): string {
  const d = String(phone || '').replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return d
}

/** "Thu, Oct 1 · 2:14 PM CT" in Central time. */
export function formatReceived(date: Date): string {
  const day = date.toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time} CT`
}

const formatSize = (bytes?: number) =>
  !bytes ? '' : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

export type LeadPhoto = { url: string; thumb?: string; name?: string; size?: number }

/** Attachment rows. Vercel Blob honors `?download=1` (Content-Disposition: attachment). */
export function photoRows(photos: LeadPhoto[] = []) {
  return photos
    .filter((p) => p?.url)
    .map((p) => {
      const name = p.name || decodeURIComponent(p.url.split('/').pop() || 'photo')
      const ext = (name.split('.').pop() || '').toUpperCase()
      const isBlob = /\.blob\.vercel-storage\.com\//.test(p.url)
      return {
        url: p.url,
        downloadUrl: isBlob ? `${p.url}${p.url.includes('?') ? '&' : '?'}download=1` : p.url,
        thumb: p.thumb || p.url,
        name,
        meta: [formatSize(p.size), ext.length <= 4 ? ext : ''].filter(Boolean).join(' · '),
      }
    })
}

export type LeadEmailContext = {
  siteUrl: string
  emergencyDisplay: string
  hoursDisplay: string
  oncallDisplay: string
  recipientNames?: string[]
  now?: Date
}

export function buildLeadEmail(lead: AnyLead, ctx: LeadEmailContext) {
  const p: AnyLead = lead.payload && typeof lead.payload === 'object' ? lead.payload : {}
  const isEmergency = lead.sourceForm === 'emergency'
  const formLabel = FORM_LABEL[p.formType] || SOURCE_LABEL[lead.sourceForm] || 'New Lead'
  const name = String(lead.name || p.name || '').trim() || 'New lead'
  const company = String(lead.company || p.company || '').trim()
  const location = String(p.location || '').trim()
  const email = String(lead.email || p.email || '').trim()
  const phone = String(lead.phone || p.phone || '').trim()
  const firstName = name.split(/\s+/)[0]

  const equipment = optLabel(EQUIPMENT_OPTIONS, p.equipment)
  const urgency = optLabel(URGENCY_OPTIONS, p.urgency)
  const request: { label: string; value: string; tone: string }[] = []
  const add = (label: string, value: unknown, tone = '') => {
    const v = value == null ? '' : String(value).trim()
    if (v) request.push({ label, value: v, tone })
  }
  add('Equipment', equipment)
  add('Brand', optLabel(BRAND_OPTIONS, p.brand))
  add('Model', p.model)
  add('Service needed', p.serviceNeeded)
  add('Condition', optLabel(CONDITION_OPTIONS, p.condition))
  add('Asking price', p.askingPrice)
  add('Urgency', urgency, URGENCY_TONE[p.urgency] || '')
  if (lead.estimatedValue) add('Est. value', `$${Number(lead.estimatedValue).toLocaleString('en-US')}`)
  // Any field added to a form later still shows up, instead of silently disappearing.
  for (const [k, v] of Object.entries(p)) {
    if (HANDLED.has(k) || v == null || typeof v === 'object') continue
    add(titleCase(k), v)
  }

  // The customer's own words. Form leads keep them in payload.message; lead.message holds the
  // composed summary (fields + message), so only fall back to it for manual/phone-in leads.
  const message = String((lead.payload ? p.message : lead.message) || '').trim()
  const whatHappened = String(p.whatHappened || '').trim()

  const raw = p.machine
  const machine = raw
    ? {
        inventoryId: raw.inventoryId,
        title: raw.title,
        url: raw.url,
        specsLine: (raw.specsSnapshot || []).slice(0, 3).map((s: AnyLead) => `${s.label}: ${s.value}`).join(' · '),
      }
    : null

  const photos = photoRows(Array.isArray(p.photoUrls) ? p.photoUrls : [])
  const pagePath = String(p.pageSource || '').trim()

  const mailSubject = `Re: your ${formLabel.toLowerCase()} — Centrifuge World`
  const view = {
    isEmergency,
    formLabel,
    leadId: lead.id,
    receivedAt: formatReceived(ctx.now || new Date()),
    name,
    firstName,
    company,
    location,
    subline: [company, location].filter(Boolean).join(' · '),
    email,
    phone,
    phoneHref: telHref(phone),
    mailtoHref: email ? `mailto:${email}?subject=${encodeURIComponent(mailSubject)}` : '',
    whatHappened,
    request,
    message,
    machine,
    photos,
    photoCount: photos.length,
    pagePath,
    pageUrl: pagePath ? (pagePath.startsWith('http') ? pagePath : `${ctx.siteUrl}${pagePath}`) : '',
    leadUrl: `${ctx.siteUrl}/admin/collections/leads/${lead.id}`,
    recipientsLine: (ctx.recipientNames || []).filter(Boolean).join(', '),
    emergencyDisplay: ctx.emergencyDisplay,
    hoursDisplay: ctx.hoursDisplay,
    oncallDisplay: ctx.oncallDisplay,
  }

  let subject: string
  if (machine) {
    subject = `[Quote Request] ${machine.title} (${machine.inventoryId}) — ${name}${company ? `, ${company}` : ''}`
  } else if (isEmergency) {
    subject = `🔴 EMERGENCY: ${name}${company ? ` — ${company}` : ''}${equipment ? ` · ${equipment} down` : ''}`
  } else {
    const tail = [equipment, urgency && urgency.toLowerCase()].filter(Boolean).join(', ')
    subject = `[${formLabel}] ${name}${company ? ` — ${company}` : ''}${tail ? ` · ${tail}` : ''}${photos.length ? ` · ${photos.length} photo${photos.length === 1 ? '' : 's'}` : ''}`
  }

  return { view, subject }
}
