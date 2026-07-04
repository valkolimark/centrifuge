'use client'

// Live Google-SERP preview + character-counter bars for the shared SEO group
// (UI-1 Phase C, the "SEO inspector" from the Content Studio mockup). Rendered as a
// UI field inside the seo group, so every collection gets it. Reads sibling fields
// live via Payload's form state.
import { useFormFields } from '@payloadcms/ui'

const TITLE_MAX = 60
const DESC_MAX = 155

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const over = value > max
  const color = over ? '#FF5C7A' : value > max * 0.9 ? '#FFB020' : '#2BD98A'
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
        <span style={{ color: 'var(--cw-ink-dim,#8FA3C8)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono,monospace)', color }}>{value}/{max}{over ? ' · over' : ''}</span>
      </div>
      <div style={{ height: 6, background: 'var(--cw-bg2,#0A1226)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .15s' }} />
      </div>
    </div>
  )
}

export default function SeoPreview() {
  const title = (useFormFields(([f]) => f?.['seo.title']?.value) as string) || ''
  const desc = (useFormFields(([f]) => f?.['seo.description']?.value) as string) || ''
  const slug = (useFormFields(([f]) => f?.slug?.value) as string) || ''
  const pageTitle = (useFormFields(([f]) => f?.title?.value ?? f?.name?.value) as string) || ''

  const shownTitle = title || pageTitle || 'Page title'
  const shownDesc = desc || 'Your meta description preview appears here — write 120–155 characters that earn the click.'
  const url = `centrifuge.com › ${slug || '…'}`

  return (
    <div style={{ border: '1px solid var(--cw-line,#1B2C55)', borderRadius: 12, padding: 14, background: 'var(--cw-panel,#0D1832)' }}>
      <div style={{ fontFamily: 'var(--font-display,sans-serif)', fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--cw-ink,#EAF2FF)' }}>
        Search preview
      </div>
      {/* Google-style SERP card */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
        <div style={{ color: '#202124', fontSize: 12 }}>{url}</div>
        <div style={{ color: '#1a0dab', fontSize: 18, lineHeight: 1.3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shownTitle}</div>
        <div style={{ color: '#4d5156', fontSize: 13, lineHeight: 1.45, marginTop: 2 }}>
          {shownDesc.length > 160 ? shownDesc.slice(0, 158) + '…' : shownDesc}
        </div>
      </div>
      <Bar label="Title length" value={title.length} max={TITLE_MAX} />
      <Bar label="Description length" value={desc.length} max={DESC_MAX} />
    </div>
  )
}
