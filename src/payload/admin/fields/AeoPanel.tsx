'use client'

// AEO inspector (UI-1 Phase C): answer-box word count with the 40–60 target band
// and TODO(marker) detection. Rendered as a UI field next to answerBox on the
// collections that have one (Services, OEM Brands, Industries, How-It-Works).
import { useFormFields } from '@payloadcms/ui'

export default function AeoPanel() {
  const answer = (useFormFields(([f]) => f?.answerBox?.value) as string) || ''
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const inBand = words >= 40 && words <= 60
  const color = words === 0 ? '#5A6E96' : inBand ? '#2BD98A' : '#FFB020'
  const todos = (answer.match(/TODO\([^)]*\)/g) || []).length

  return (
    <div style={{ border: '1px solid var(--cw-line,#1B2C55)', borderRadius: 12, padding: 14, background: 'var(--cw-panel,#0D1832)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-display,sans-serif)', fontWeight: 600, fontSize: 13, color: 'var(--cw-ink,#EAF2FF)' }}>Answer-engine readiness</span>
        <span style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: 12, color }}>{words} words</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--cw-ink-dim,#8FA3C8)', lineHeight: 1.5 }}>
        {words === 0
          ? 'Add a 40–60 word direct answer under the H1 so AI answer engines can quote it.'
          : inBand
            ? '✓ In the ideal 40–60 word band for answer-box eligibility.'
            : words < 40
              ? `${40 - words} more word(s) to reach the 40–60 band.`
              : `${words - 60} word(s) over the 60-word band — tighten for a cleaner answer.`}
      </div>
      {todos > 0 ? (
        <div style={{ marginTop: 8, padding: '6px 9px', borderRadius: 8, background: 'rgba(255,176,32,.1)', border: '1px solid rgba(255,176,32,.35)', color: '#FFB020', fontSize: 12 }}>
          ⚠ {todos} unresolved TODO(marker) in the answer — resolve before publishing.
        </div>
      ) : null}
    </div>
  )
}
