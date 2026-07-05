/* Hosted quote page (UI-2 §6). Public, noindex, unguessable token. Renders the SENT
 * snapshot (not the live draft) with the shared QuoteDocument; logs a view and flips
 * sent→viewed on first visit per session; expired quotes show a banner + phone. */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { QuoteDocument } from '@/components/quote/QuoteDocument'
import { toQuoteView, type QuoteView } from '@/lib/quotes/view'
import { ViewPing } from './ViewPing'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function loadQuote(token: string) {
  const payload = await getPayloadClient()
  const res = await payload
    .find({ collection: 'quotes', where: { viewToken: { equals: token } }, depth: 1, limit: 1, overrideAccess: true })
    .catch(() => ({ docs: [] as any[] }))
  return res.docs[0] as any
}

export default async function HostedQuote({ params }: { params: Promise<{ viewToken: string }> }) {
  const { viewToken } = await params
  const quote = await loadQuote(viewToken)
  if (!quote) notFound()

  const snaps: any[] = quote.sentSnapshots || []
  const latest = snaps[snaps.length - 1]
  const view: QuoteView = latest?.docData || toQuoteView(quote)
  const isExpired =
    quote.status === 'expired' ||
    (quote.validUntil && new Date(quote.validUntil) < new Date() && ['sent', 'viewed'].includes(quote.status))
  const pdfUrl: string | null = latest?.pdf?.url || null
  const phone = view.locations[0]?.phone || view.emergencyDisplay

  return (
    <main style={{ minHeight: '100vh', background: '#0A111F', padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {isExpired && (
          <div style={{ background: 'rgba(225,25,0,.10)', border: '1px solid rgba(225,25,0,.4)', color: '#FFB4AC', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
            This quote has <b>expired</b>. Call <b style={{ color: '#fff' }}>{phone}</b> and we&apos;ll send you an updated quote.
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          {pdfUrl && (
            <a href={pdfUrl} download style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: '#00719C', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14, padding: '9px 18px', borderRadius: 6 }}>
              ⬇ Download PDF
            </a>
          )}
        </div>
        <QuoteDocument view={view} />
        <p style={{ textAlign: 'center', color: '#5A6C8F', fontSize: 12, marginTop: 20 }}>
          Questions? Reply to the email this quote came from, or call {phone}. To accept, contact your Centrifuge World rep.
        </p>
      </div>
      <ViewPing token={viewToken} />
    </main>
  )
}
