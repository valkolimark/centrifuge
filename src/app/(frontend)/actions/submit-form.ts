'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { validateSubmission } from '@/lib/forms/schema'
import { verifyTurnstile } from '@/lib/forms/turnstile'
import { getFormConfig } from '@/lib/forms/config'
import { sendLeadNotification } from '@/lib/email/notify'
import type { FormType } from '@/lib/analytics'

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

  // Collect scalar fields (skip files + control fields).
  const raw: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('_') && key !== 'photos') {
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

  const payload = await getPayloadClient()

  // Best-effort photo storage: upload to the media library when a storage adapter
  // is configured; otherwise record the count (integration deferred until BLOB token).
  const files = formData.getAll('photos').filter((v): v is File => v instanceof File && v.size > 0)
  const photoIds: (string | number)[] = []
  if (files.length && process.env.BLOB_READ_WRITE_TOKEN) {
    for (const file of files.slice(0, 6)) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const media = await payload.create({
          collection: 'media',
          data: { alt: `${config.title} photo from ${result.data.name || 'submitter'}` },
          file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
        })
        photoIds.push(media.id)
      } catch {
        // ignore individual upload failure; submission still records
      }
    }
  }

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
        utm,
        payload: { ...result.data, photoCount: files.length, photoIds },
      },
    })
  } catch (err) {
    console.error('[submit-form] failed to store submission', err)
    return { status: 'error', message: 'Something went wrong saving your request. Please call us.' }
  }

  // Notify the four inboxes (non-blocking failure — the lead is already stored).
  try {
    await sendLeadNotification(payload, {
      type,
      data: result.data,
      pageSource,
      photoCount: files.length,
      utm,
    })
  } catch (err) {
    console.error('[submit-form] notification email failed', err)
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
