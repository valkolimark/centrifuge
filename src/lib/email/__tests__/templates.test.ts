import { describe, it, expect } from 'vitest'
import { renderTemplate } from '../render'
import { TEMPLATES } from '../templates'

const FIXTURES: Record<string, Record<string, unknown>> = {
  'form-lead-internal': {
    isEmergency: true,
    formTypeLabel: 'Emergency Service',
    name: 'Tom Okafor',
    company: 'LoneStar Chemical',
    receivedAt: 'Jul 05, 2026 · 09:14 CT',
    fields: [
      { label: 'Email', value: 'tom@lonestar.com' },
      { label: 'Phone', value: '(281) 555-0164' },
    ],
    message: 'Decanter down on line 2, vibration alarm then hard stop.',
    leadUrl: 'https://centrifuge.com/admin/collections/leads/abc123',
    emergencyDisplay: '832-338-4990',
  },
  'form-lead-ack': {
    name: 'Priya Nair',
    hoursDisplay: 'Mon–Fri: 6:00 AM – 6:00 PM',
    oncallDisplay: 'On-Call 24/7',
    phoneDisplay: '(800) 208-6075',
    emergencyDisplay: '832-338-4990',
  },
  'quote-delivery': {
    quoteNumber: 'CW-Q-2026-0147',
    scopeTitle: 'GEA CF 4000 Annual Overhaul & Bowl Balancing',
    clientName: 'Hannah Brooks',
    clientCompany: 'Sugarland Food Processing',
    total: '$23,165.50',
    validUntil: 'Aug 04, 2026',
    viewUrl: 'https://centrifuge.com/quote/tok_abc',
    hasPdf: true,
    emergencyDisplay: '832-338-4990',
  },
  'quote-reminder': {
    quoteNumber: 'CW-Q-2026-0141',
    scopeTitle: 'Alfa Laval NX 944 full rebuild',
    clientName: 'D. Kaminski',
    total: '$48,750.00',
    validUntil: 'Jul 26, 2026',
    viewUrl: 'https://centrifuge.com/quote/tok_def',
    daysLeft: 5,
    emergencyDisplay: '832-338-4990',
  },
}

describe('email templates render with fixture data', () => {
  for (const [name, tpl] of Object.entries(TEMPLATES)) {
    it(`${name}: renders html + text with no unresolved Liquid`, async () => {
      const { html, text } = await renderTemplate(tpl, FIXTURES[name])
      expect(html.length).toBeGreaterThan(50)
      expect(text.length).toBeGreaterThan(10)
      // no leftover Liquid tags/output
      for (const out of [html, text]) {
        expect(out).not.toMatch(/\{\{/)
        expect(out).not.toMatch(/\{%/)
      }
    })
  }

  it('form-lead-internal surfaces the emergency flag, payload fields, message and deep link', async () => {
    const { html, text } = await renderTemplate(TEMPLATES['form-lead-internal'], FIXTURES['form-lead-internal'])
    expect(html).toContain('Emergency')
    expect(html).toContain('tom@lonestar.com')
    expect(html).toContain('/admin/collections/leads/abc123')
    expect(text).toContain('[EMERGENCY]')
    expect(text).toContain('Decanter down on line 2')
  })

  it('quote-delivery shows number, total, valid-until and the hosted link, and notes the PDF', async () => {
    const { html } = await renderTemplate(TEMPLATES['quote-delivery'], FIXTURES['quote-delivery'])
    expect(html).toContain('CW-Q-2026-0147')
    expect(html).toContain('$23,165.50')
    expect(html).toContain('Aug 04, 2026')
    expect(html).toContain('https://centrifuge.com/quote/tok_abc')
    expect(html.toLowerCase()).toContain('attached')
  })

  it('quote-reminder pluralizes days correctly', async () => {
    const one = await renderTemplate(TEMPLATES['quote-reminder'], { ...FIXTURES['quote-reminder'], daysLeft: 1 })
    expect(one.text).toContain('1 day left')
    const many = await renderTemplate(TEMPLATES['quote-reminder'], { ...FIXTURES['quote-reminder'], daysLeft: 5 })
    expect(many.text).toContain('5 days left')
  })
})
