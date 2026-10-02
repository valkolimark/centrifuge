import { describe, it, expect } from 'vitest'
import { renderTemplate } from '../render'
import { TEMPLATES } from '../templates'
import { buildLeadEmail, telHref, photoRows } from '../lead-view'
import { SAMPLE_LEADS, CTX, BLOB } from '../__fixtures__/leads'

const render = async (key: string) => {
  const { view, subject } = buildLeadEmail(SAMPLE_LEADS[key], CTX)
  const out = await renderTemplate(TEMPLATES['form-lead-internal'], view)
  return { ...out, view, subject }
}

describe('new-lead email', () => {
  it('maps option slugs to human labels and never shows raw slugs or anti-spam fields', async () => {
    const { html, text, view } = await render('quote')
    expect(view.request.map((r) => r.value)).toEqual(['Decanter', 'Alfa Laval', 'NX 4500', 'Full rebuild, bowl balancing', 'This week'])
    for (const out of [html, text]) {
      expect(out).not.toContain('alfa-laval')
      expect(out).not.toContain('this-week')
      expect(out).not.toContain('Turnstile')
      expect(out).not.toContain('PageSource')
      expect(out).not.toMatch(/\{\{|\{%/)
    }
  })

  it('shows the customer message once, escaped, with line breaks kept', async () => {
    const { html, text } = await render('quote')
    expect(html).toContain('since last week&#39;s shutdown.<br />')
    expect(html).toContain('&amp; the bearing housing &lt;see below&gt;')
    expect(html).not.toContain('composed summary')
    expect(text).toContain("since last week's shutdown.\n\nPhotos attached")
  })

  it('links every attachment directly (view + download), with no login', async () => {
    const { html, text } = await render('quote')
    expect(html).toContain(`href="${BLOB}/scroll-flights-a1b2c3d4e5.jpg"`)
    expect(html).toContain(`href="${BLOB}/scroll-flights-a1b2c3d4e5.jpg?download=1"`)
    expect(html).toContain(`href="${BLOB}/bearing-housing-f6a7b8c9d0.jpg?download=1"`)
    expect(html).toContain('Attachments (2)')
    expect(html).toContain('922 KB · JPG')
    expect(text).toContain(`${BLOB}/bearing-housing-f6a7b8c9d0.jpg`)
  })

  it('has call + email buttons instead of the broken "reply to this email" line', async () => {
    const { html } = await render('quote')
    expect(html).toContain('href="tel:+12815550142"')
    expect(html).toContain('href="mailto:jordan.ellis@example.com?subject=Re%3A%20your%20quote%20request')
    expect(html).not.toMatch(/Reply directly/i)
    expect(html).toContain('/admin/collections/leads/742')
    expect(html).toContain('Sent to Mark, Ron, David, Cynthia')
  })

  it('uses the real form name and a descriptive subject', async () => {
    const { subject, html } = await render('quote')
    expect(subject).toBe('[Quote Request] Jordan Ellis — Gulf Coast Rendering Co. · Decanter, this week · 2 photos')
    expect(html).toContain('Thu, Oct 1 · 2:14 PM CT')
    const inspection = buildLeadEmail({ ...SAMPLE_LEADS.quote, sourceForm: 'contact', payload: { ...SAMPLE_LEADS.quote.payload, formType: 'free_inspection' } }, CTX)
    expect(inspection.view.formLabel).toBe('Free Inspection')
  })

  it('emergency: red banner, what happened first, phone-only fallback, subject says what is down', async () => {
    const { html, text, subject } = await render('emergency')
    expect(subject).toBe('🔴 EMERGENCY: Sam Ortega — Midwest Starch Processing · Disc Stack down')
    expect(html).toContain('EMERGENCY — equipment down')
    expect(html).toContain('No email given — phone only')
    expect(html.indexOf('What happened')).toBeLessThan(html.indexOf('What they need'))
    expect(html).toContain("won&#39;t restart.<br />")
    expect(text).toMatch(/^\*\*\* EMERGENCY/)
  })

  it('inventory leads lead with the machine', async () => {
    const { html, subject } = await render('machine')
    expect(subject).toBe('[Quote Request] Sample decanter listing (INV-0000) — Priya Raman, Lakeshore Biofuels')
    expect(html).toContain('Machine requested · INV-0000')
    expect(html).toContain('Material: Stainless')
  })

  it('manual leads without a payload fall back to lead.message', async () => {
    const { html, view } = await render('manual')
    expect(view.formLabel).toBe('Phone-in')
    expect(html).toContain('Called about a gearbox.<br />')
  })

  it('helpers', () => {
    expect(telHref('(281) 555-0142')).toBe('+12815550142')
    expect(telHref('1-800-208-6075')).toBe('+18002086075')
    // Legacy proxy URLs (pre-redesign leads) still link, without the Blob download flag.
    const [legacy] = photoRows([{ url: 'https://centrifuge.com/api/media/file/a.jpg' }])
    expect(legacy.downloadUrl).toBe('https://centrifuge.com/api/media/file/a.jpg')
    expect(legacy.name).toBe('a.jpg')
  })
})
