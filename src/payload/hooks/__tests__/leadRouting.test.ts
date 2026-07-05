import { describe, it, expect, beforeEach, vi } from 'vitest'
import { routeLead } from '../leadRouting'

// Ensure dry-run (no credentials) so no network is touched.
beforeEach(() => {
  delete process.env.TWILIO_API_KEY_SID
  delete process.env.TWILIO_API_KEY_SECRET
  delete process.env.TWILIO_ACCOUNT_SID
  delete process.env.TWILIO_AUTH_TOKEN
  delete process.env.LEADS_EMAIL_DRY_RUN
})

function fakePayload(recipients: { name: string; email: string; enabled?: boolean }[]) {
  const updates: any[] = []
  return {
    updates,
    findGlobal: vi.fn(async () => ({ recipients })),
    update: vi.fn(async (args: any) => { updates.push(args); return args.data }),
  }
}

const FOUR = [
  { name: 'Mark', email: 'mark@p5400.com' },
  { name: 'Ron', email: 'ron@p5400.com' },
  { name: 'David', email: 'david@p5400.com' },
  { name: 'Cynthia', email: 'cynthia@p5400.com' },
]

describe('routeLead (dry-run)', () => {
  it('sends to all enabled recipients, records op id + 4 delivery rows + activity', async () => {
    const payload = fakePayload(FOUR)
    const lead = { id: 'lead1', name: 'Dale Herrera', company: 'Gulf Coast Rendering', email: 'd@gcr.com', phone: '281', sourceForm: 'quote-request', message: 'rebuild', payload: {} }

    await routeLead(payload as any, lead)

    expect(payload.update).toHaveBeenCalledTimes(1)
    const data = payload.updates[0].data
    expect(payload.updates[0].context).toEqual({ skipRouting: true })
    expect(String(data.twilioOperationId)).toMatch(/^dry_/)
    expect(data.delivery).toHaveLength(4)
    expect(data.delivery.every((d: any) => d.status === 'delivered')).toBe(true) // dry-run resolves COMPLETED
    const types = data.activity.map((a: any) => a.type)
    expect(types).toContain('form_received')
    expect(types).toContain('routed')
    expect(types).toContain('acknowledged') // submitter has an email
  })

  it('honors the "all four" rule via enabled filter and never throws on missing email', async () => {
    const payload = fakePayload([...FOUR, { name: 'Off', email: 'off@x.com', enabled: false }])
    const lead = { id: 'lead2', name: 'No Email', sourceForm: 'contact', payload: {} }
    await expect(routeLead(payload as any, lead)).resolves.toBeUndefined()
    const data = payload.updates[0].data
    expect(data.delivery).toHaveLength(4) // disabled recipient excluded
    const types = data.activity.map((a: any) => a.type)
    expect(types).not.toContain('acknowledged') // no submitter email → no ack
  })

  it('falls back to routing.json recipients when the global is unseeded', async () => {
    const payload = {
      updates: [] as any[],
      findGlobal: vi.fn(async () => { throw new Error('not seeded') }),
      update: vi.fn(async (args: any) => { (payload.updates as any[]).push(args); return args.data }),
    }
    const lead = { id: 'lead3', name: 'Jane', email: 'jane@x.com', sourceForm: 'emergency', payload: {} }
    await routeLead(payload as any, lead as any)
    const data = payload.updates[0].data
    expect(data.delivery.length).toBeGreaterThanOrEqual(4) // from data/routing.json
  })
})
