'use client'

import { usePathname } from 'next/navigation'
import { useReveal } from '@/lib/motion'

// Mounts the IntersectionObserver reveal hook and re-runs it on every route change
// (pathname) so content revealed via CSS shows after client-side navigation too.
export function MotionRoot() {
  const pathname = usePathname()
  useReveal(pathname)
  return null
}
