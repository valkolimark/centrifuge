/* Normalizes a Payload quote doc into the view model rendered by the QuoteDocument
 * component (UI-2 §5). NAP data (locations, phones, hours) comes ONLY from data/nap.json;
 * totals are computed here (never stored). All quotes issue from Rosharon, TX. */
import nap from '../../../data/nap.json'

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const phoneDisplay = (role: string) => (nap.phones as Record<string, { display: string }>)[role]?.display ?? ''
const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

// Issuing location is always Rosharon (the nap.json "houston" record — marketed Houston,
// physical Rosharon). The three location blocks render in the mockup's order.
const LOCATION_ORDER = ['houston', 'franklin-park', 'alsip'] as const
const ISSUING_ID = 'houston'

export type QuoteLineView = { description: string; qty: number; unitPrice: string; amount: string }
export type QuoteLocationView = { heading: string; issuing: boolean; addressLines: string[]; phone: string }
export type QuoteView = {
  quoteNumber: string
  client: { contactName: string; company: string; email: string }
  scopeTitle: string
  issuedDate: string
  validUntil: string | null
  lines: QuoteLineView[]
  subtotal: string
  taxRate: number
  tax: string
  total: string
  terms: string
  status: string
  locations: QuoteLocationView[]
  emergencyDisplay: string
  hoursDisplay: string
  footerLines: string[]
}

export function toQuoteView(quote: Record<string, any>): QuoteView {
  const items: { description?: string; qty?: number; unitPrice?: number }[] = quote.lineItems ?? []
  let subtotal = 0
  const lines: QuoteLineView[] = items.map((li) => {
    const qty = Number(li.qty) || 0
    const unit = Number(li.unitPrice) || 0
    const amount = qty * unit
    subtotal += amount
    return { description: li.description || '—', qty, unitPrice: money(unit), amount: money(amount) }
  })
  const taxRate = Number(quote.taxRate) || 0
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  const issued = quote.sentAt || quote.createdAt ? new Date(quote.sentAt || quote.createdAt) : new Date()
  let validUntil: string | null = null
  if (quote.validUntil) validUntil = fmtDate(new Date(quote.validUntil))
  else if (quote.validDays) {
    const d = new Date(issued)
    d.setDate(d.getDate() + Number(quote.validDays))
    validUntil = fmtDate(d)
  }

  const locations: QuoteLocationView[] = LOCATION_ORDER.map((id) => {
    const loc = nap.locations.find((l) => l.id === id)!
    return {
      heading: `${loc.addressLocality}, ${loc.addressRegion}`,
      issuing: id === ISSUING_ID,
      addressLines: [loc.streetAddress, `${loc.addressLocality}, ${loc.addressRegion} ${loc.postalCode}`],
      phone: phoneDisplay(loc.phone),
    }
  })

  return {
    quoteNumber: quote.quoteNumber || 'CW-Q-DRAFT',
    client: {
      contactName: quote.client?.contactName || '',
      company: quote.client?.company || '',
      email: quote.client?.email || '',
    },
    scopeTitle: quote.scopeTitle || '',
    issuedDate: fmtDate(issued),
    validUntil,
    lines,
    subtotal: money(subtotal),
    taxRate,
    tax: money(tax),
    total: money(total),
    terms: quote.terms || '',
    status: quote.status || 'draft',
    locations,
    emergencyDisplay: nap.phones.emergency.display,
    hoursDisplay: nap.hours.office.display,
    footerLines: ['centrifuge.com', 'quotes@centrifuge.com', 'Rosharon TX · Franklin Park IL · Alsip IL'],
  }
}
