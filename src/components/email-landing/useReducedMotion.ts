'use client'
import { useEffect, useState } from 'react'
// true when the visitor asked for reduced motion (or before hydration, so nothing animates by default)
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
