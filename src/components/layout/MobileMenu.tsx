'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { navigation, featuredBrands, emergencyPhone, phone, type NavItem } from '@/lib/site'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { cn } from '@/lib/cn'

// Flagship component. Full-screen overlay, opens <=200ms, order from
// navigation.mobile_menu_order, pinned safety-orange emergency bar, 44px+ targets,
// focus-trapped, Esc/overlay-tap closes, body scroll locked, no layout shift.
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Body scroll lock (no layout shift: compensate scrollbar width).
  useEffect(() => {
    if (!open) return
    const scrollBarComp = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollBarComp > 0) document.body.style.paddingRight = `${scrollBarComp}px`
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [open])

  // Esc to close + focus trap.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-blue-deep/60 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      {/* panel */}
      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-lg',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* pinned emergency bar */}
        <div className="flex items-center justify-between gap-2 bg-safety px-4 py-3 text-white">
          <PhoneLink role="emergency" className="text-white">
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-normal uppercase tracking-wide opacity-90">
                24/7 Emergency
              </span>
              <span className="text-lg font-bold">{emergencyPhone.display}</span>
            </span>
          </PhoneLink>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-button bg-white/15 text-white"
          >
            <span className="sr-only">Close menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain p-4">
          <Link
            href="/request-a-quote/"
            onClick={onClose}
            className="mb-4 flex min-h-[48px] items-center justify-center rounded-button bg-blue px-5 font-semibold text-white"
          >
            Request a Quote
          </Link>

          <ul className="divide-y divide-steel-300">
            {navigation.header.map((item) => (
              <li key={item.label}>
                <MobileEntry item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>

          {/* call + text row */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <PhoneLink
              role="main"
              className="flex min-h-[48px] items-center justify-center rounded-button border border-steel-300 text-navy"
            >
              Call Us
            </PhoneLink>
            <a
              href={`sms:${phone('chicago').number}`}
              onClick={onClose}
              className="flex min-h-[48px] items-center justify-center rounded-button border border-steel-300 text-navy"
            >
              Text Us
            </a>
          </div>
        </nav>
      </div>
    </div>
  )
}

function MobileEntry({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false)

  if ('href' in item && item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="flex min-h-[48px] items-center font-medium text-navy"
      >
        {item.label}
      </Link>
    )
  }

  const leaves = collectLeaves(item)
  return (
    <div>
      <button
        type="button"
        className="flex min-h-[48px] w-full items-center justify-between font-medium text-navy"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {item.label}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={cn('transition-transform duration-150', expanded && 'rotate-180')}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {expanded ? (
        <ul className="pb-2 pl-3">
          {leaves.map((leaf) => (
            <li key={leaf.href}>
              {leaf.external ? (
                <a
                  href={leaf.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex min-h-[44px] items-center text-sm',
                    leaf.style === 'emergency' ? 'font-semibold text-safety' : 'text-steel-700',
                  )}
                >
                  {leaf.label}
                </a>
              ) : (
                <Link
                  href={leaf.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex min-h-[44px] items-center text-sm',
                    leaf.style === 'emergency' ? 'font-semibold text-safety' : 'text-steel-700',
                  )}
                >
                  {leaf.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function collectLeaves(item: NavItem): Array<{ label: string; href: string; external?: boolean; style?: string }> {
  if (!('type' in item)) return []
  if (item.type === 'dropdown') return item.items
  if (item.type === 'megamenu' && 'groups' in item && item.groups) {
    return item.groups.flatMap((g) => g.items)
  }
  if (item.type === 'megamenu' && item.label === 'Brands We Service') {
    return [
      ...featuredBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}/` })),
      { label: 'All 45+ Brands →', href: '/brands/' },
    ]
  }
  return []
}
