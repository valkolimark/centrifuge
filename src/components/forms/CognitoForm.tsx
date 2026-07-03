'use client'

import { useEffect, useRef, useState } from 'react'

// Embeds a Cognito Forms form via a direct iframe (more reliable than the seamless
// script, which did not initialize when injected dynamically). The Cognito page
// posts height messages to the parent, which we use to auto-size the iframe.
export function CognitoForm({ dataKey, formId }: { dataKey: string; formId: string }) {
  const [loaded, setLoaded] = useState(false)
  const [height, setHeight] = useState(720)
  const [resized, setResized] = useState(false)
  const src = `https://www.cognitoforms.com/f/${dataKey}/${formId}`
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!/(^|\.)cognitoforms\.com$/.test(new URL(e.origin).hostname || '')) return
      const d: unknown = e.data
      let h: number | undefined
      if (typeof d === 'number') h = d
      else if (typeof d === 'string') {
        const n = Number(d)
        if (Number.isFinite(n)) h = n
        else
          try {
            const p = JSON.parse(d) as Record<string, unknown>
            h = Number(p.height ?? p.formHeight)
          } catch {
            /* ignore */
          }
      } else if (d && typeof d === 'object') {
        const p = d as Record<string, unknown>
        h = Number(p.height ?? p.formHeight ?? (p.data as Record<string, unknown> | undefined)?.height)
      }
      if (h && Number.isFinite(h) && h > 120) {
        setHeight(Math.ceil(h) + 8)
        setResized(true)
        setLoaded(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="relative">
      <iframe
        ref={ref}
        src={src}
        title="Request form"
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height, border: 0, display: 'block' }}
        // If Cognito hasn't reported a height yet, allow internal scroll so a long
        // form is never clipped; once auto-sized, no scrollbar is needed.
        scrolling={resized ? 'no' : 'auto'}
      />
      {!loaded ? (
        <div className="absolute inset-0 space-y-3 bg-white" aria-hidden="true">
          <div className="h-11 animate-pulse rounded-button bg-steel-100" />
          <div className="h-11 animate-pulse rounded-button bg-steel-100" />
          <div className="h-11 animate-pulse rounded-button bg-steel-100" />
          <div className="h-28 animate-pulse rounded-button bg-steel-100" />
          <div className="h-11 w-40 animate-pulse rounded-button bg-steel-300" />
          <p className="text-sm text-steel-500">Loading form…</p>
        </div>
      ) : null}
      <noscript>
        <p className="text-steel-700">
          This form requires JavaScript. Please call us or use our{' '}
          <a href="/request-a-quote/" className="text-link underline">
            standard quote form
          </a>
          .
        </p>
      </noscript>
    </div>
  )
}
