'use client'

import { useState } from 'react'

// Click-to-load Google Maps facade — no map JS/iframe loads until the user opts in
// (keeps third-party requests off the initial load). Uses the keyless embed.
export function MapFacade({ query, label }: { query: string; label: string }) {
  const [loaded, setLoaded] = useState(false)
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  return (
    <div className="relative overflow-hidden rounded-card border border-steel-300 bg-steel-100" style={{ aspectRatio: '16 / 9' }}>
      {loaded ? (
        <iframe src={src} title={`Map: ${label}`} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <button type="button" onClick={() => setLoaded(true)} className="group absolute inset-0 grid h-full w-full place-items-center bg-navy/5">
          <span className="flex flex-col items-center gap-2 text-navy">
            <span className="grid h-12 w-12 place-items-center rounded-pill bg-white shadow-md" aria-hidden="true">
              📍
            </span>
            <span className="font-semibold">View map — {label}</span>
            <span className="text-sm text-steel-500">Click to load Google Maps</span>
          </span>
        </button>
      )}
    </div>
  )
}
