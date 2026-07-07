'use client'

// Shows the photos a submitter uploaded, as a thumbnail strip on the Lead / Form Submission
// edit view. Reads photoUrls (absolute url + thumbnail) out of the record's `payload` JSON —
// no extra relationship column needed. Each thumb links to the full-size image (Vercel Blob).
import { useFormFields } from '@payloadcms/ui'

type Photo = { url: string; thumb?: string; name?: string }

export default function SubmissionPhotos() {
  const photos = (useFormFields(([fields]) => fields?.payload?.value) as { photoUrls?: Photo[] } | undefined)?.photoUrls || []
  if (!photos.length) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Uploaded photos ({photos.length})</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {photos.map((p, i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            title={p.name || 'photo'}
            style={{ display: 'block', width: 96, height: 96, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--theme-elevation-150)', background: 'var(--theme-elevation-50)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb || p.url} alt={p.name || 'photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </a>
        ))}
      </div>
    </div>
  )
}
