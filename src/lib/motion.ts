'use client'

// Motion layer (task 1.5). A tiny IntersectionObserver hook that adds `.is-visible`
// to elements carrying `.reveal`. All actual animation is CSS (see globals.css);
// this file only toggles a class. Honors prefers-reduced-motion by no-op'ing.
// Target: total motion JS <= 2KB gzipped.
import { useEffect } from 'react'

export function useReveal(rootMargin = '0px 0px -10% 0px') {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (nodes.length === 0) return

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
    return () => io.disconnect()
  }, [rootMargin])
}
