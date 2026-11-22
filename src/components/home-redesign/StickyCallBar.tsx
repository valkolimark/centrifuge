'use client'

import { useEffect, useState } from 'react'
import { TelLink } from './TelLink'
import { PRIMARY_PHONE_ROLE, primaryDisplay } from './config'

// Phone-only (under 768, CSS) fixed call bar. Hidden at the top of the page and while the
// hero, S5 band or footer call is on screen; otherwise shown after 400px. While hidden it is
// aria-hidden and out of the tab order. The slide is CSS (240ms) and is off under reduced motion.
export function StickyCallBar({ watchIds }: { watchIds: string[] }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const els = watchIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const visible = new Set<Element>()
    const update = () => setOn(window.scrollY > 400 && visible.size === 0)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)))
      update()
    })
    els.forEach((el) => io.observe(el))
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', update)
    }
  }, [watchIds])

  return (
    <div className={`cwh-sticky${on ? ' is-on' : ''}`} aria-hidden={!on} data-testid="sticky-call">
      <TelLink role={PRIMARY_PHONE_ROLE} className="cwh-btn cwh-btn-call" tabIndex={on ? 0 : -1}>
        <span className="cwh-nw">Call Centrifuge World:</span>{' '}
        <span className="cwh-nw cwh-num">{primaryDisplay}</span>
      </TelLink>
    </div>
  )
}
