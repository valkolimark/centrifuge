'use client'
import { useEffect, useState } from 'react'
import { trackPhoneClick } from '@/lib/analytics'
// Phone-only sticky call bar (<640px). Stays up until an in-page call or the form submit is at least 50% visible,
// measured in the viewport area below the sticky site header and above this bar (same rule as the approved
// static pages, round 6d). Also hidden while a form field has focus, so it never covers a field.
export function StickyCallBar({ role, number, label }: { role: string; number: string; label: string }) {
  const [hidden, setHidden] = useState(true)
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.el-mcall')
    const watch = [...document.querySelectorAll('.el-root .el-btn-call:not(.el-mcall *)'), document.querySelector('#form button[type=submit]')].filter(Boolean) as Element[]
    let typing = false
    const hdrB = () => {
      const h = document.querySelector('header')
      if (!h) return 0
      const cs = getComputedStyle(h)
      return cs.position === 'sticky' || cs.position === 'fixed' ? Math.max(0, h.getBoundingClientRect().bottom) : 0
    }
    const update = () => {
      const top = hdrB()
      const bottom = window.innerHeight - (bar ? bar.offsetHeight : 0) // bar height reserved even while hidden
      const seen = watch.some((el) => {
        const r = el.getBoundingClientRect()
        if (r.height <= 0) return false
        const vis = Math.max(0, Math.min(r.bottom, bottom) - Math.max(r.top, top))
        return vis / r.height >= 0.5
      })
      setHidden(typing || seen)
    }
    const io = new IntersectionObserver(update, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })
    watch.forEach((t) => io.observe(t))
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update)
    const form = document.getElementById('form')
    const fi = () => { typing = true; update() }, fo = () => { typing = false; update() }
    form?.addEventListener('focusin', fi); form?.addEventListener('focusout', fo)
    update()
    return () => {
      io.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update)
      form?.removeEventListener('focusin', fi); form?.removeEventListener('focusout', fo)
    }
  }, [])
  const [lab, num] = label.split(/:\s+/)
  return (
    <div className={`el-mcall sm:hidden ${hidden ? 'invisible' : ''}`}>
      <a href={`tel:${number}`} className="el-btn el-btn-call w-full" onClick={() => trackPhoneClick(role, number)} data-cta-position="lp-sticky-call">
        <span className="whitespace-nowrap">{lab}:</span> <span className="whitespace-nowrap">{num}</span>
      </a>
    </div>
  )
}
