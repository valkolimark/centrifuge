/* Twilio Email operator (CYCLE UI-2 §1). The single path for every send in this cycle.
 *
 * Endpoint:  POST https://comms.twilio.com/v1/Emails   (async → 202 { operationId, operationLocation })
 * Auth:      HTTP Basic — API Key SID + Secret preferred; Account SID + Auth Token fallback (dev).
 * Contract:  202 means QUEUED, not delivered. Persist operationId and poll the operation to
 *            resolve delivery. Retry 429/5xx 3× with exponential backoff + jitter.
 * Limits:    10 MB max message size incl. attachments (enforced here); no Unicode in `from`.
 * Safety:    LEADS_EMAIL_DRY_RUN (default ON unless explicitly "false") logs the payload and
 *            never calls Twilio — so development never emails real recipients.
 *
 * Content is rendered app-side (see ./render) and sent as final HTML+text; per-recipient
 * `variables` are still forwarded for Twilio-side Liquid should a template ever need them.
 */

const API_BASE = 'https://comms.twilio.com/v1'
const MAX_MESSAGE_BYTES = 10 * 1024 * 1024 // 10 MB incl. attachments
const MAX_RETRIES = 3

export type EmailAddress = { address: string; name?: string }
export type EmailRecipient = EmailAddress & { variables?: Record<string, string> }
export type EmailAttachment = { filename: string; content: string; type: string } // content = base64
export type SendEmailInput = {
  from: EmailAddress | string
  to: Array<EmailRecipient | string>
  subject: string
  html: string
  text: string
  replyTo?: string
  cc?: string[]
  variables?: Record<string, string> // applied to every recipient (recipient vars win)
  attachments?: EmailAttachment[]
  tags?: Record<string, string>
}
export type SendResult = {
  dryRun: boolean
  operationId: string | null
  operationLocation: string | null
  recipients: string[]
}
export type OperationStatus = {
  dryRun: boolean
  id: string
  status: 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED' | 'UNKNOWN'
  stats: Record<string, number>
}

export class EmailTooLargeError extends Error {
  readonly bytes: number
  constructor(bytes: number) {
    super(`Email payload ${(bytes / 1_048_576).toFixed(2)} MB exceeds the ${MAX_MESSAGE_BYTES / 1_048_576} MB Twilio limit`)
    this.name = 'EmailTooLargeError'
    this.bytes = bytes
  }
}

// ── config ────────────────────────────────────────────────────────────────
function creds() {
  const keySid = process.env.TWILIO_API_KEY_SID
  const keySecret = process.env.TWILIO_API_KEY_SECRET
  if (keySid && keySecret) return { user: keySid, pass: keySecret }
  const acct = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (acct && token) return { user: acct, pass: token }
  return null
}
export const hasCredentials = () => creds() !== null
// Dry-run is the default. Only real when explicitly disabled AND credentials exist.
export const isDryRun = () => process.env.LEADS_EMAIL_DRY_RUN !== 'false' || !hasCredentials()

const asAddress = (a: EmailAddress | string): EmailAddress => (typeof a === 'string' ? { address: a } : a)
const asRecipient = (r: EmailRecipient | string): EmailRecipient => (typeof r === 'string' ? { address: r } : r)
// `from` display name must be ASCII-only (Twilio rejects Unicode in `from`).
const asciiOnly = (s: string) => s.replace(/[^\x20-\x7E]/g, '').trim()

// ── size guard ────────────────────────────────────────────────────────────
export function estimateSizeBytes(input: SendEmailInput): number {
  let bytes = Buffer.byteLength(input.subject || '', 'utf8')
  bytes += Buffer.byteLength(input.html || '', 'utf8')
  bytes += Buffer.byteLength(input.text || '', 'utf8')
  for (const a of input.attachments ?? []) {
    // base64 → raw is ~3/4 the encoded length
    bytes += Math.ceil((a.content?.length ?? 0) * 0.75) + Buffer.byteLength(a.filename || '', 'utf8')
  }
  return bytes
}

// ── request body (Twilio Email shape, camelCase) ────────────────────────────
export function buildRequestBody(input: SendEmailInput) {
  const from = asAddress(input.from)
  const to = input.to.map(asRecipient).map((r) => ({
    address: r.address,
    ...(r.name ? { name: r.name } : {}),
    ...(input.variables || r.variables ? { variables: { ...(input.variables ?? {}), ...(r.variables ?? {}) } } : {}),
  }))
  const headers: Record<string, string> = {}
  if (input.replyTo) headers['Reply-To'] = input.replyTo
  const body: Record<string, unknown> = {
    from: { address: from.address, ...(from.name ? { name: asciiOnly(from.name) } : {}) },
    to,
    content: {
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(Object.keys(headers).length ? { headers } : {}),
    },
  }
  if (input.cc?.length) body.cc = input.cc.map((address) => ({ address }))
  if (input.attachments?.length) body.attachments = input.attachments
  if (input.tags) body.tags = input.tags
  return body
}

function authHeader(): string {
  const c = creds()
  if (!c) throw new Error('Twilio credentials missing (TWILIO_API_KEY_SID/SECRET or TWILIO_ACCOUNT_SID/AUTH_TOKEN)')
  return 'Basic ' + Buffer.from(`${c.user}:${c.pass}`).toString('base64')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
// Exponential backoff with jitter: ~0.5s, ~1s, ~2s (+ up to 250ms jitter).
const backoff = (attempt: number) => 2 ** attempt * 500 + Math.floor((attempt + 1) * 137) % 250

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, init)
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) { await sleep(backoff(attempt)); continue }
      }
      return res
    } catch (err) {
      lastErr = err
      if (attempt < MAX_RETRIES) { await sleep(backoff(attempt)); continue }
      throw err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Twilio request failed after retries')
}

// ── public API ──────────────────────────────────────────────────────────────
export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const recipients = input.to.map(asRecipient).map((r) => r.address)

  const bytes = estimateSizeBytes(input)
  if (bytes > MAX_MESSAGE_BYTES) throw new EmailTooLargeError(bytes)

  const body = buildRequestBody(input)

  if (isDryRun()) {
    // Never call Twilio in dry-run. Log a compact record; return a synthetic operation id.
    // eslint-disable-next-line no-console
    console.info('[twilio:dry-run] would send email', {
      from: body.from, to: recipients, cc: input.cc ?? [], subject: input.subject,
      replyTo: input.replyTo, attachments: (input.attachments ?? []).map((a) => a.filename), bytes,
    })
    return { dryRun: true, operationId: `dry_${Date.now().toString(36)}`, operationLocation: null, recipients }
  }

  const res = await fetchWithRetry(`${API_BASE}/Emails`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status !== 202) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Twilio Email send failed: ${res.status} ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as { operationId?: string; operationLocation?: string }
  return {
    dryRun: false,
    operationId: json.operationId ?? null,
    operationLocation: json.operationLocation ?? null,
    recipients,
  }
}

export async function getOperationStatus(operationId: string): Promise<OperationStatus> {
  if (isDryRun() || operationId.startsWith('dry_')) {
    return { dryRun: true, id: operationId, status: 'COMPLETED', stats: { total: 0, delivered: 0 } }
  }
  const res = await fetchWithRetry(`${API_BASE}/Emails/Operations/${operationId}`, {
    method: 'GET',
    headers: { Authorization: authHeader() },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Twilio operation fetch failed: ${res.status} ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as { id?: string; status?: OperationStatus['status']; stats?: Record<string, number> }
  return { dryRun: false, id: json.id ?? operationId, status: json.status ?? 'UNKNOWN', stats: json.stats ?? {} }
}

export const _internal = { MAX_MESSAGE_BYTES, backoff }
