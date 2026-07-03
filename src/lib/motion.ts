'use client'

// Motion layer (task 1.5). A tiny IntersectionObserver hook that adds `.is-visible`
// to elements carrying `.reveal`. All actual animation is CSS (see globals.css);
// this file only toggles a class. Honors prefers-reduced-motion by no-op'ing.
// Target: total motion JS <= 2KB gzipped.
import { useEffect } from 'react'

// `trigger` (e.g. the current pathname) re-runs the observer setup after client-
// side navigation, so `.reveal` elements on the newly-rendered page get observed
// and revealed — otherwise they stay at opacity:0 (invisible) after a route change.
export function useReveal(trigger?: unknown, rootMargin = '0px 0px -10% 0px') {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
    if (nodes.length === 0) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin, threshold: 0.1 },
    )
    nodes.forEach((n) => io.observe(n))

    // Safety net: if anything is left unrevealed shortly after (e.g. a fast route
    // change where IO hasn't fired), reveal on-screen elements directly.
    const t = window.setTimeout(() => {
      for (const n of nodes) {
        const r = n.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('is-visible')
      }
    }, 400)

    return () => {
      io.disconnect()
      window.clearTimeout(t)
    }
  }, [trigger, rootMargin])
}
