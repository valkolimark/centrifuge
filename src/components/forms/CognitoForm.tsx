'use client'

import { useEffect, useState } from 'react'

// Embeds a Cognito Forms form via a direct iframe + Cognito's official iframe.js,
// which auto-resizes the iframe to its content height (so there is no internal
// scrollbar). A skeleton shows until the iframe loads.
export function CognitoForm({ dataKey, formId }: { dataKey: string; formId: string }) {
  const [loaded, setLoaded] = useState(false)
  const src = `https://www.cognitoforms.com/f/${dataKey}/${formId}`

  useEffect(() => {
    // Load Cognito's iframe auto-resize script once per page.
    if (!document.querySelector('script[data-cognito-iframe]')) {
      const s = document.createElement('script')
      s.src = 'https://www.cognitoforms.com/f/iframe.js'
      s.async = true
      s.setAttribute('data-cognito-iframe', 'true')
      document.body.appendChild(s)
    }
  }, [])

  return (
    <div className="relative">
      <iframe
        src={src}
        title="Request form"
        onLoad={() => setLoaded(true)}
        height={700}
        scrolling="no"
        className="block w-full"
        style={{ border: 0, width: '1px', minWidth: '100%' }}
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
