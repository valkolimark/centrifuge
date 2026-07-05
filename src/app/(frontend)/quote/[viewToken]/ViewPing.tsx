'use client'
/* Fires once per browser session to log a view + flip the quote sent→viewed (UI-2 §6). */
import { useEffect } from 'react'

export function ViewPing({ token }: { token: string }) {
  useEffect(() => {
    try {
      const key = 'qv_' + token
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
      fetch('/api/quotes/view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      /* sessionStorage unavailable — skip */
    }
  }, [token])
  return null
}
