'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { TelLink } from './TelLink'
import { PRIMARY_PHONE_ROLE, primaryDisplay } from './config'
import logo from './img/cw-logo-full-color.png'

export interface HomeNavItem {
  label: string
  href: string
  items?: { label: string; href: string }[]
}

// S0 header. 64px. Sticky only at 1024 and wider (CSS). Under 1024: logo + Menu button.
// Desktop dropdowns are native <details> (keyboard and screen-reader friendly, no library).
export function HomeHeader({ nav }: { nav: HomeNavItem[] }) {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Close desktop dropdowns on outside click or Escape; only one open at a time.
  useEffect(() => {
    const root = navRef.current
    if (!root) return
    const all = () => [...root.querySelectorAll('details')]
    const onDoc = (e: MouseEvent) => {
      all().forEach((d) => {
        if (!d.contains(e.target as Node)) d.open = false
      })
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        all().forEach((d) => (d.open = false))
        setOpen(false)
      }
    }
    const onToggle = (e: Event) => {
      const t = e.target as HTMLDetailsElement
      if (t.open) all().forEach((d) => d !== t && (d.open = false))
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    root.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
      root.removeEventListener('toggle', onToggle, true)
    }
  }, [])

  return (
    <header className="cwh-header">
      <div className="cwh-wrap cwh-hbar">
        <Link className="cwh-logo" href="/" aria-label="Centrifuge World home">
          <Image src={logo} alt="Centrifuge World" width={140} height={45} priority={false} sizes="140px" />
        </Link>

        <nav ref={navRef} className="cwh-nav" aria-label="Main">
          <ul>
            {nav.map((n) =>
              n.items ? (
                <li key={n.label}>
                  <details className="cwh-dd">
                    <summary>{n.label}</summary>
                    <ul className="cwh-dd-panel">
                      {n.items.map((it) => (
                        <li key={it.href}>
                          <Link href={it.href}>{it.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={n.label}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <TelLink role={PRIMARY_PHONE_ROLE} className="cwh-btn cwh-btn-call cwh-hcall">
          Call <span className="cwh-num">{primaryDisplay}</span>
        </TelLink>

        <button
          type="button"
          className="cwh-menu"
          aria-expanded={open}
          aria-controls="cwh-mpanel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div id="cwh-mpanel" className="cwh-mpanel" hidden={!open}>
        <div className="cwh-wrap">
          <ul>
            {nav.map((n) => (
              <li key={n.label}>
                <Link href={n.href} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <TelLink role={PRIMARY_PHONE_ROLE} className="cwh-btn cwh-btn-call cwh-mcall-link">
            <span className="cwh-nw">Call Centrifuge World:</span>{' '}
            <span className="cwh-nw cwh-num">{primaryDisplay}</span>
          </TelLink>
        </div>
      </div>
    </header>
  )
}
