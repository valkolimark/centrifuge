import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildRequestBody,
  estimateSizeBytes,
  sendEmail,
  getOperationStatus,
  EmailTooLargeError,
  hasCredentials,
  isDryRun,
  _internal,
} from '../twilio'

const base = {
  from: 'notifications@centrifuge.com',
  to: ['a@x.com'],
  subject: 'Hi',
  html: '<p>hi</p>',
  text: 'hi',
}

describe('twilio buildRequestBody', () => {
  it('maps to the Twilio Email shape (from/to/content) with reply-to header, cc and merged variables', () => {
    const body: any = buildRequestBody({
      from: { address: 'quotes@centrifuge.com', name: 'Centrifuge World' },
      to: [{ address: 'client@acme.com', name: 'Client', variables: { firstName: 'Sam' } }],
      subject: 'Quote',
      html: '<b>x</b>',
      text: 'x',
      replyTo: 'ron@p5400.com',
      cc: ['mark@p5400.com', 'ron@p5400.com'],
      variables: { company: 'Acme' },
    })
    expect(body.from).toEqual({ address: 'quotes@centrifuge.com', name: 'Centrifuge World' })
    expect(body.to[0].address).toBe('client@acme.com')
    expect(body.to[0].variables).toEqual({ company: 'Acme', firstName: 'Sam' }) // global + recipient merged
    expect(body.content.subject).toBe('Quote')
    expect(body.content.html).toBe('<b>x</b>')
    expect(body.content.headers['Reply-To']).toBe('ron@p5400.com')
    expect(body.cc).toEqual([{ address: 'mark@p5400.com' }, { address: 'ron@p5400.com' }])
  })

  it('strips Unicode from the from display name (Twilio rejects Unicode in from)', () => {
    const body: any = buildRequestBody({ ...base, from: { address: 'a@b.com', name: 'Café ☕ World' } })
    expect(/[^\x20-\x7E]/.test(body.from.name)).toBe(false)
  })
})

describe('twilio size guard', () => {
  it('estimateSizeBytes counts subject+html+text+attachments', () => {
    const bytes = estimateSizeBytes({ ...base, attachments: [{ filename: 'q.pdf', content: 'A'.repeat(1000), type: 'application/pdf' }] })
    expect(bytes).toBeGreaterThan(700) // ~750 from the base64 body alone
  })

  it('sendEmail throws EmailTooLargeError above 10MB (before any network/dry-run)', async () => {
    const huge = 'A'.repeat(15 * 1024 * 1024) // 15MB base64 → ~11.25MB raw, over the 10MB guard
    await expect(
      sendEmail({ ...base, attachments: [{ filename: 'big.pdf', content: huge, type: 'application/pdf' }] }),
    ).rejects.toBeInstanceOf(EmailTooLargeError)
  })
})

describe('twilio dry-run (default, no credentials)', () => {
  beforeEach(() => {
    delete process.env.TWILIO_API_KEY_SID
    delete process.env.TWILIO_API_KEY_SECRET
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.LEADS_EMAIL_DRY_RUN
  })

  it('reports no credentials and dry-run on', () => {
    expect(hasCredentials()).toBe(false)
    expect(isDryRun()).toBe(true)
  })

  it('sendEmail returns a synthetic operation id and never calls Twilio', async () => {
    const res = await sendEmail({ ...base, to: ['a@x.com', 'b@x.com'] })
    expect(res.dryRun).toBe(true)
    expect(res.operationId).toMatch(/^dry_/)
    expect(res.recipients).toEqual(['a@x.com', 'b@x.com'])
  })

  it('getOperationStatus resolves a synthetic dry-run operation as COMPLETED', async () => {
    const s = await getOperationStatus('dry_abc')
    expect(s.dryRun).toBe(true)
    expect(s.status).toBe('COMPLETED')
  })

  it('stays dry-run even if LEADS_EMAIL_DRY_RUN=false when credentials are absent', () => {
    process.env.LEADS_EMAIL_DRY_RUN = 'false'
    expect(isDryRun()).toBe(true) // no creds → still safe
  })
})

describe('twilio credentials + live toggle', () => {
  it('detects credentials and honors explicit live opt-in', () => {
    process.env.TWILIO_API_KEY_SID = 'SKxxxx'
    process.env.TWILIO_API_KEY_SECRET = 'secret'
    process.env.LEADS_EMAIL_DRY_RUN = 'false'
    expect(hasCredentials()).toBe(true)
    expect(isDryRun()).toBe(false)
    process.env.LEADS_EMAIL_DRY_RUN = 'true'
    expect(isDryRun()).toBe(true)
    delete process.env.TWILIO_API_KEY_SID
    delete process.env.TWILIO_API_KEY_SECRET
    delete process.env.LEADS_EMAIL_DRY_RUN
  })
})

describe('backoff', () => {
  it('increases across attempts', () => {
    expect(_internal.backoff(1)).toBeGreaterThan(_internal.backoff(0))
    expect(_internal.backoff(2)).toBeGreaterThan(_internal.backoff(1))
  })
})
