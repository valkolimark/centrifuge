'use client'
import { createElement, useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from './useReducedMotion'
// Scroll reveal, once: 20px + fade, 450ms. Never wraps phone numbers, H1, call buttons or form fields.
export function Reveal({ as = 'div', className, children }: { as?: 'div' | 'figure'; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !('IntersectionObserver' in window)) return
    el.classList.add('el-reveal')
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])
  return createElement(as, { ref, className }, children)
}
