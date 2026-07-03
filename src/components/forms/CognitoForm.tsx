'use client'

import { useEffect, useRef, useState } from 'react'

// Embeds a Cognito Forms "seamless" form. To keep pages fast, the script is only
// injected when the form nears the viewport (so it's ready by the time the user
// scrolls to it, and doesn't compete with initial page load). A skeleton shows
// until the real form renders. Pair with a preconnect to www.cognitoforms.com.
export function CognitoForm({ dataKey, formId }: { dataKey: string; formId: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [inject, setInject] = useState(false)
  const [ready, setReady] = useState(false)

  // Trigger injection when the form is near the viewport.
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInject(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInject(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Inject seamless.js into the (React-empty) host; watch for the rendered form.
  useEffect(() => {
    if (!inject) return
    const host = hostRef.current
    if (!host) return
    host.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://www.cognitoforms.com/f/seamless.js'
    script.async = true
    script.setAttribute('data-key', dataKey)
    script.setAttribute('data-form', formId)
    host.appendChild(script)

    const mo = new MutationObserver(() => {
      // Form is up once the host has a non-script element (the injected form/iframe).
      if (Array.from(host.children).some((c) => c.tagName !== 'SCRIPT')) setReady(true)
    })
    mo.observe(host, { childList: true, subtree: true })
    const fallback = window.setTimeout(() => setReady(true), 4000)
    return () => {
      mo.disconnect()
      window.clearTimeout(fallback)
    }
  }, [inject, dataKey, formId])

  return (
    <div className="relative">
      {/* seamless.js renders the form in here; React never manages its children */}
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
