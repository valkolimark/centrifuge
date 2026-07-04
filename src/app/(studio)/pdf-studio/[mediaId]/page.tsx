/* eslint-disable @next/next/no-html-link-for-pages -- /admin/* are Payload routes (separate root layout); plain <a> is required for a full navigation. */
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { PdfAnnotations } from '@/components/pdf/PdfAnnotations'

export const dynamic = 'force-dynamic'

// PDF Studio workspace (UI-1 Phase E, v1). Renders the PDF via the browser's native
// viewer (reliable, no pdf.js worker setup) with a comment-annotation panel that
// persists overlay objects to the Media doc's pdfAnnotations field.
// v2 boundary (documented in the exit report): freehand ink / stamp overlays and a
// pdf-lib "flatten annotations → new PDF" export + save-rev-to-Media.
export default async function PdfStudioPage({ params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  let doc: Record<string, unknown> | null = null
  try {
    doc = (await payload.findByID({ collection: 'media', id: mediaId, depth: 0 })) as unknown as Record<string, unknown>
  } catch {
    doc = null
  }
  if (!doc) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: 12 }}>
        <p>PDF not found.</p>
        <a href="/admin/collections/media" style={{ color: '#3EC9F5' }}>← Back to Media</a>
      </div>
    )
  }
  const url = String(doc.url || '')
  const filename = String(doc.filename || 'document.pdf')
  const isPdf = String(doc.mimeType || '').includes('pdf')

  return (
    <div style={{ display: 'grid', gridTemplateRows: '52px 1fr 30px', gridTemplateColumns: '1fr 320px', gridTemplateAreas: '"top top" "stage dock" "foot foot"', height: '100vh' }}>
      <header style={{ gridArea: 'top', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #1B2C55', background: '#0A1226' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href={`/admin/collections/media/${mediaId}`} style={{ color: '#8FA3C8', fontSize: 13 }}>← Media</a>
          <strong style={{ fontSize: 14 }}>PDF Studio</strong>
          <span style={{ color: '#5A6E96', fontSize: 12 }}>{filename}</span>
        </div>
        <span style={{ fontSize: 11, color: '#5A6E96' }}>Export &amp; flatten → v2</span>
      </header>

      <main style={{ gridArea: 'stage', background: '#050912', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        {isPdf && url ? (
          <iframe src={url} title={filename} style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
        ) : (
          <div style={{ color: '#8FA3C8', textAlign: 'center' }}>
            {isPdf ? 'This PDF has no accessible file URL.' : 'This file is not a PDF.'}
          </div>
        )}
      </main>

      <aside style={{ gridArea: 'dock', borderLeft: '1px solid #1B2C55', background: '#0D1832', padding: 16, overflowY: 'auto' }}>
        <PdfAnnotations mediaId={mediaId} initial={(doc.pdfAnnotations as unknown) ?? null} />
      </aside>

      <footer style={{ gridArea: 'foot', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderTop: '1px solid #1B2C55', background: '#0A1226', fontSize: 11, color: '#5A6E96' }}>
        <span>Native render · comment annotations persist to Media</span>
        <span>{user.email}</span>
      </footer>
    </div>
  )
}
