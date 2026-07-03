'use client'

import { useEffect, useRef } from 'react'

// Embeds a Cognito Forms "seamless" form. seamless.js injects the form markup
// immediately after its own <script> element, so we append that script inside a
// ref'd container and the form renders in place. Used to preserve the legacy
// /cw-ez-quote-for-sales/ URL (indexed by Google) with its original form.
export function CognitoForm({ dataKey, formId }: { dataKey: string; formId: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://www.cognitoforms.com/f/seamless.js'
    script.async = true
    script.setAttribute('data-key', dataKey)
    script.setAttribute('data-form', formId)
    container.appendChild(script)
    return () => {
      container.innerHTML = ''
    }
  }, [dataKey, formId])

  return (
    <div>
      <div ref={ref} />
      <noscript>
        <p className="text-steel-700">
          This quote form requires JavaScript. Please call us or use our{' '}
          <a href="/request-a-quote/" className="text-link underline">
            standard quote form
          </a>
          .
        </p>
      </noscript>
    </div>
  )
}
