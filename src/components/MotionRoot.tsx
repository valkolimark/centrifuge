'use client'

import { useReveal } from '@/lib/motion'

// Mounts the IntersectionObserver reveal hook once at the app root.
// Renders nothing. All animation is CSS (globals.css .reveal).
export function MotionRoot() {
  useReveal()
  return null
}
