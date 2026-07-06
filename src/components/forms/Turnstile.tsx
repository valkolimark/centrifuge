'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

// Cloudflare Turnstile wrapper (invisible/managed). Renders a hidden input named
// `cf-turnstile-response` that the server validates. No-ops gracefully when the
// site key env var is absent (Cycle 1 placeholder) so forms still render/build.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
    }
  }
}

export function Turnstile({ onToken }: { onToken?: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!siteKey || !ready || !ref.current || !window.turnstile) return
    // NOTE: 'invisible' is NOT a valid explicit-render `size` (valid: normal/flexible/compact),
    // and passing it silently prevents the widget from rendering / producing a token — which
    // surfaced as "Anti-spam check failed". Render the managed widget at default size; it
    // auto-verifies for legitimate visitors and injects the cf-turnstile-response field.
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token: string) => onToken?.(token),
    })
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
    }
  }, [siteKey, ready, onToken])

  if (!siteKey) {
    // Placeholder mode: emit an empty response so server validation can detect
    // "turnstile not configured" vs "failed" and skip in non-production.
    return <input type="hidden" name="cf-turnstile-response" value="" data-turnstile="unconfigured" />
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="cf-turnstile" />
    </>
  )
}
