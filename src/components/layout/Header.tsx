'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { navigation, featuredBrands, type NavItem } from '@/lib/site'
import { ButtonLink } from '@/components/ui/Button'
import { EmergencyBar } from './EmergencyBar'
import { MobileMenu } from './MobileMenu'
import { cn } from '@/lib/cn'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-heading text-navy" aria-label="Centrifuge World — home">
      <span className="grid h-9 w-9 place-items-center rounded-button bg-navy text-white font-bold">CW</span>
      <span className="text-lg font-bold leading-none">
        Centrifuge<span className="text-blue"> World</span>
      </span>
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <EmergencyBar />
      <div className="border-b border-steel-300">
        <div className="container-cw flex items-center justify-between gap-4 py-3">
          <Logo />

          <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navigation.header.map((item) => (
              <NavEntry key={item.label} item={item} open={open} setOpen={setOpen} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/cw-ez-quote-for-sales/" className="hidden sm:inline-flex" size="md">
              Request a Quote
            </ButtonLink>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-button border border-steel-300 text-navy lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}

function NavEntry({
  item,
  open,
  setOpen,
}: {
  item: NavItem
  open: string | null
  setOpen: (v: string | null) => void
}) {
  if ('href' in item && item.href) {
    return (
      <Link href={item.href} className="rounded px-3 py-2 text-[0.95rem] font-medium text-steel-700 hover:text-navy">
        {item.label}
      </Link>
    )
  }

  const isOpen = open === item.label
  const panelId = `nav-${item.label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(item.label)}
      onMouseLeave={() => setOpen(null)}
    >
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 rounded px-3 py-2 text-[0.95rem] font-medium hover:text-navy',
          isOpen ? 'text-navy' : 'text-steel-700',
        )}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpen(isOpen ? null : item.label)}
      >
        {item.label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          className="absolute left-0 top-full z-50 mt-1 rounded-card border border-steel-300 bg-white p-4 shadow-lg"
          role="group"
          aria-label={item.label}
        >
          <MenuPanel item={item} onNavigate={() => setOpen(null)} />
        </div>
      ) : null}
    </div>
  )
}

function MenuPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  if (!('type' in item)) return null
  if (item.type === 'megamenu' && 'groups' in item && item.groups) {
    return (
      <div className="grid w-[46rem] grid-cols-3 gap-6">
        {item.groups.map((group) => (
          <div key={group.heading}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-500">
              {group.heading}
            </p>
            <ul className="space-y-1">
              {group.items.map((leaf) => (
                <li key={leaf.label}>
                  <MenuLink leaf={leaf} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  if (item.type === 'megamenu' && item.label === 'Brands We Service') {
    return (
      <div className="w-[36rem]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-500">Featured Brands</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
          {featuredBrands.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/brands/${b.slug}/`}
                className="block rounded px-2 py-1.5 text-sm text-steel-700 hover:bg-steel-100 hover:text-navy"
                onClick={onNavigate}
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/brands/"
          className="mt-3 inline-block font-semibold text-link hover:text-navy"
          onClick={onNavigate}
        >
          All 45+ Brands →
        </Link>
      </div>
    )
  }

  if (item.type === 'dropdown') {
    return (
      <ul className="w-64 space-y-1">
        {item.items.map((leaf) => (
          <li key={leaf.label}>
            <MenuLink leaf={leaf} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    )
  }
  return null
}

function MenuLink({
  leaf,
  onNavigate,
}: {
  leaf: { label: string; href: string; external?: boolean; style?: string }
  onNavigate: () => void
}) {
  const cls = cn(
    'block rounded px-2 py-1.5 text-sm hover:bg-steel-100',
    leaf.style === 'emergency' ? 'font-semibold text-safety' : 'text-steel-700 hover:text-navy',
  )
  if (leaf.external) {
    return (
      <a href={leaf.href} className={cls} onClick={onNavigate}>
        {leaf.label}
      </a>
    )
  }
  return (
    <Link href={leaf.href} className={cls} onClick={onNavigate}>
      {leaf.label}
    </Link>
  )
}
