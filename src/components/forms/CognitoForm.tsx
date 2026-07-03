'use client'

import { useEffect, useRef, useState } from 'react'

// Embeds a Cognito Forms "seamless" form. seamless.js injects the form right after
// its own <script>, so we append that script into a host div on mount. A skeleton
// shows until the form renders (or a short fallback), and the head preconnects to
// cognitoforms.com so the fetch is fast.
export function CognitoForm({ dataKey, formId }: { dataKey: string; formId: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    host.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://www.cognitoforms.com/f/seamless.js'
    script.async = true
    script.setAttribute('data-key', dataKey)
    script.setAttribute('data-form', formId)
    host.appendChild(script)

    // Reveal once the form (a non-script node) appears in the host.
    const mo = new MutationObserver(() => {
      if (Array.from(host.children).some((c) => c.tagName !== 'SCRIPT')) setReady(true)
    })
    mo.observe(host, { childList: true, subtree: true })

    // Fallback: clear the skeleton even if detection misses.
    const fallback = window.setTimeout(() => setReady(true), 3500)

    return () => {
      mo.disconnect()
      window.clearTimeout(fallback)
    }
  }, [dataKey, formId])

  return (
    <div>
      {/* seamless.js renders the form here; React never manages its children */}
      <div ref={hostRef} />
      {!ready ? (
        <div className="space-y-3" aria-hidden="true">
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
