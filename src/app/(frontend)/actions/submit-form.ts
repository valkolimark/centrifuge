'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { validateSubmission } from '@/lib/forms/schema'
import { verifyTurnstile } from '@/lib/forms/turnstile'
import { getFormConfig, EQUIPMENT_OPTIONS, BRAND_OPTIONS, URGENCY_OPTIONS, CONDITION_OPTIONS } from '@/lib/forms/config'
import { getInventoryItem } from '@/lib/inventory'
import { machineContext } from '@/lib/inventory-machine'
import { SITE_URL } from '@/lib/site'
import type { FormType } from '@/lib/analytics'

const optLabel = (opts: readonly { value: string; label: string }[], v?: string) =>
  (v && opts.find((o) => o.value === v)?.label) || v

// Compose a human-readable summary of every submitted field so the lead's `message`
// (shown in the pipeline drawer + CRM) carries the full picture, not just the free text.
// The complete raw field set is still stored verbatim in `payload`.
function composeDetails(data: Record<string, string>, photoCount: number): string {
  const rows: Array<[string, string | undefined]> = [
    ['Location', data.location],
    ['Equipment', optLabel(EQUIPMENT_OPTIONS, data.equipment)],
    ['Brand', optLabel(BRAND_OPTIONS, data.brand)],
    ['Model', data.model],
    ['Service needed', data.serviceNeeded],
    ['Urgency', optLabel(URGENCY_OPTIONS, data.urgency)],
    ['Condition', optLabel(CONDITION_OPTIONS, data.condition)],
    ['Asking price', data.askingPrice],
  ]
  const lines = rows.filter(([, v]) => v && String(v).trim()).map(([k, v]) => `${k}: ${v}`)
  if (photoCount) lines.push(`Photos attached: ${photoCount}`)
  const details = lines.join('\n')
  const free = data.message?.trim()
  return [details, free].filter(Boolean).join('\n\n')
}

// Map public form types to the leads pipeline source (UI-2).
const SOURCE_FORM: Record<FormType, 'contact' | 'quote-request' | 'emergency'> = {
  request_quote: 'quote-request',
  emergency_service: 'emergency',
  free_inspection: 'contact',
  sell_centrifuge: 'contact',
  contact: 'contact',
  send_photos: 'contact',
}

export interface FormState {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Record<string, string>
  /** Echoed back so the client can show the right success screen. */
  submittedType?: FormType
}

const VALID_TYPES = new Set<FormType>([
  'request_quote',
  'emergency_service',
  'free_inspection',
  'sell_centrifuge',
  'contact',
  'send_photos',
])

export async function submitForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const type = String(formData.get('_type') || '') as FormType
  if (!VALID_TYPES.has(type)) {
    return { status: 'error', message: 'Unknown form type.' }
  }
  const config = getFormConfig(type)

  // Collect scalar fields (skip files + control fields). The Turnstile token is verified
  // separately (read straight off formData), so keep it out of the stored payload/email.
  const raw: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('_') && key !== 'photos' && key !== 'cf-turnstile-response') {
      raw[key] = value
    }
  }
  // Apply locked field values (e.g. emergency urgency).
  if (config.locked) for (const [k, v] of Object.entries(config.locked)) raw[k] = v

  // Anti-spam: Turnstile (server) + honeypot (in validate).
  const token = String(formData.get('cf-turnstile-response') || '') || undefined
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
  const turnstileOk = await verifyTurnstile(token, ip)
  if (!turnstileOk) {
    return { status: 'error', message: 'Anti-spam check failed. Please try again.' }
  }

  const result = validateSubmission(type, raw)
  if (!result.ok || !result.data) {
    if (result.errors?._spam) {
      // Honeypot tripped — pretend success so bots get no signal.
      return { status: 'success', submittedType: type }
    }
    return { status: 'error', errors: result.errors, message: 'Please fix the highlighted fields.' }
  }

  const pageSource = String(formData.get('_page') || '')
  const utm = safeJson(String(formData.get('_utm') || ''))

  // Phase 3: if the submission came from an inventory machine, re-derive the snapshot
  // server-side from the slug (authoritative — never trusts the client JSON) and stamp
  // a durable `machine` snapshot + `inventory/{slug}` source onto the lead. The snapshot
  // is point-in-time: it survives the inventory doc later being edited or deleted.
  const machineSlug = safeMachineSlug(String(formData.get('_machine') || ''))
  const machineItem = machineSlug ? await getInventoryItem(machineSlug) : null
  const machine = machineItem ? machineContext(machineItem).snapshot : undefined
  const source = machine ? `inventory/${machineSlug}` : undefined

  const payload = await getPayloadClient()

  // Best-effort photo storage: upload to the media library when a storage adapter
  // is configured; otherwise record the count (integration deferred until BLOB token).
  const files = formData.getAll('photos').filter((v): v is File => v instanceof File && v.size > 0)
  const photoIds: (string | number)[] = []
  // Absolute URLs (+ thumbnail) captured at upload time so both the email and the admin
  // thumbnail strip can show the photos without re-resolving media ids.
  const photoUrls: Array<{ url: string; thumb: string; name: string }> = []
  const abs = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${SITE_URL}${u}`) : '')
  if (files.length && process.env.BLOB_READ_WRITE_TOKEN) {
    for (const file of files.slice(0, 6)) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const media: any = await payload.create({
          collection: 'media',
          data: { alt: `${config.title} photo from ${result.data.name || 'submitter'}` },
          file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
        })
        photoIds.push(media.id)
        const full = abs(media.url)
        if (full) photoUrls.push({ url: full, thumb: abs(media.sizes?.thumbnail?.url) || full, name: media.filename || file.name })
      } catch {
        // ignore individual upload failure; submission still records
      }
    }
  }

  const fullPayload = { ...result.data, photoCount: files.length, photoIds, photoUrls, pageSource, ...(machine ? { machine, source } : {}) }
  // Human-readable summary of every field — surfaced on both the submission (readonly
  // `details`) and the lead (`message`) so nothing is buried in the raw JSON payload.
  const baseDetails = composeDetails(result.data as Record<string, string>, files.length)
  const details = machine
    ? `Machine requested: ${machine.title} (${machine.inventoryId})\n${machine.url}\n\n${baseDetails}`
    : baseDetails

  // Store the raw submission (kept for the Mission Control dashboard) — best-effort.
  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        type,
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        company: result.data.company,
        pageSource,
        details,
        utm,
        payload: fullPayload,
      },
    })
  } catch (err) {
    console.error('[submit-form] failed to store submission', err)
  }

  // Create the lead — its afterChange hook routes the branded Twilio batch email to all
  // recipients + a submitter acknowledgement (UI-2 §3). The DB write is the lead of
  // record; if the create fails the submitter still gets a graceful error.
  try {
    await payload.create({
      collection: 'leads',
      data: {
        name: result.data.name,
        company: result.data.company,
        email: result.data.email,
        phone: result.data.phone,
        sourceForm: SOURCE_FORM[type],
        message: details,
        payload: fullPayload,
      },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[submit-form] failed to create lead', err)
    return { status: 'error', message: 'Something went wrong saving your request. Please call us.' }
  }

  return { status: 'success', submittedType: type }
}

function safeJson(s: string): Record<string, string> {
  try {
    return s ? (JSON.parse(s) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

// Pull just the slug out of the client's `_machine` payload — everything else is re-derived
// server-side from the slug, so a tampered snapshot can only reference a real listing (or none).
function safeMachineSlug(s: string): string | undefined {
  try {
    const o = s ? (JSON.parse(s) as { slug?: unknown }) : null
    const slug = o && typeof o.slug === 'string' ? o.slug : ''
    return /^[a-z0-9-]{1,200}$/.test(slug) ? slug : undefined
  } catch {
    return undefined
  }
}
