/* eslint-disable @next/next/no-html-link-for-pages -- every link targets /admin/* (the Payload app), not Next page routes */
'use client'
/* Mission Control admin sidebar — pixel-faithful port of the UI-1 dashboard mockup nav.
   Replaces Payload's default Nav (admin.components.Nav). Grouped links wired to real admin
   routes, active-route highlighting, collapse-to-icon-rail (persisted), and the bottom
   profile card with client-side avatar preview. */
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import './nav.css'

type Item = { label: string; href: string; icon: React.ReactNode; pill?: string; pillCyan?: boolean; match: (p: string) => boolean }

const svg = (children: React.ReactNode) => <svg viewBox="0 0 24 24">{children}</svg>
const ICON = {
  dashboard: svg(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  analytics: svg(<><path d="M3 17l5-6 4 3 6-8" /><path d="M3 21h18" /></>),
  radar: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>),
  pages: svg(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></>),
  brands: svg(<><path d="M20 7L12 3 4 7v10l8 4 8-4z" /><path d="M12 11l8-4M12 11L4 7m8 4v10" /></>),
  inventory: svg(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></>),
  resources: svg(<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6" /></>),
  crm: svg(<><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M21 21v-2a4 4 0 00-3-3.87" /></>),
  forms: svg(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 9l10 6 10-6" /></>),
  quote: svg(<path d="M9 18l6-6-6-6" />),
  locations: svg(<><path d="M4 4h16v16H4z" /><path d="M9 9h6v6H9z" /></>),
  redirects: svg(<path d="M13 2L4.5 12.5H11L10 22l8.5-10.5H13z" />),
  settings: svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></>),
}

const coll = (slug: string) => (p: string) => p.startsWith(`/admin/collections/${slug}`)

export default function NavClient({ counts, user }: { counts: { brands: number; newLeads: number }; user: { name: string; role: string } }) {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // Apply persisted collapse state to the .cw-admin wrapper (which owns --nav-width).
  useEffect(() => {
    const c = localStorage.getItem('cwNavCollapsed') === '1'
    setCollapsed(c)
    document.querySelector('.cw-admin')?.classList.toggle('cw-nav-collapsed', c)
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    document.querySelector('.cw-admin')?.classList.toggle('cw-nav-collapsed', next)
    localStorage.setItem('cwNavCollapsed', next ? '1' : '0')
  }

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.size > 2 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  const GROUPS: { label: string; items: Item[] }[] = [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/admin', icon: ICON.dashboard, match: (p) => p === '/admin' },
      { label: 'Analytics', href: '/admin', icon: ICON.analytics, pill: 'GA4', pillCyan: true, match: () => false },
      { label: 'Competitor Radar', href: '/admin/collections/competitor-snapshots', icon: ICON.radar, match: coll('competitor-snapshots') },
    ] },
    { label: 'Content Studio', items: [
      { label: 'Pages & Blog', href: '/admin/collections/pages', icon: ICON.pages, match: (p) => coll('pages')(p) || coll('posts')(p) },
      { label: 'OEM Brands', href: '/admin/collections/oem-brands', icon: ICON.brands, pill: String(counts.brands || 0), pillCyan: true, match: coll('oem-brands') },
      { label: 'Products & Inventory', href: '/admin/collections/inventory', icon: ICON.inventory, match: coll('inventory') },
      { label: 'Resources & PDFs', href: '/admin/collections/media', icon: ICON.resources, match: coll('media') },
    ] },
    { label: 'Revenue Engine', items: [
      { label: 'CRM & Leads', href: '/admin/leads-quotes?tab=pipeline', icon: ICON.crm, pill: String(counts.newLeads || 0), match: (p) => p.startsWith('/admin/leads-quotes') },
      { label: 'Form Submissions', href: '/admin/collections/form-submissions', icon: ICON.forms, match: coll('form-submissions') },
      { label: 'Quote Builder', href: '/admin/leads-quotes?tab=builder', icon: ICON.quote, match: () => false },
    ] },
    { label: 'System', items: [
      { label: 'Locations & Schema', href: '/admin/collections/locations', icon: ICON.locations, match: coll('locations') },
      { label: 'Redirects & SEO', href: '/admin/collections/redirects', icon: ICON.redirects, match: coll('redirects') },
      { label: 'Settings', href: '/admin/globals/site-settings', icon: ICON.settings, match: (p) => p.startsWith('/admin/globals') },
    ] },
  ]

  const initials = (user.name || 'CW').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="cw-nav" ref={rootRef as any}>
      <div className="cwn-brand">
        <div className="cwn-brand-icon">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo/cw-icon.png" alt="Centrifuge World" /></div>
        <div className="cwn-brand-word">
          <span className="cwn-cw">CENTRIFUGE</span>
          <span className="cwn-world">world</span>
          <span className="cwn-estd">Est<sup>d</sup> 1939 · Mission Control</span>
        </div>
      </div>

      <nav className="cwn-nav">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="cwn-nav-label">{g.label}</div>
            {g.items.map((it) => (
              <a key={it.label} href={it.href} className={it.match(pathname) ? 'cwn-active' : undefined} title={it.label}>
                {it.icon}
                <span className="cwn-label">{it.label}</span>
                {it.pill ? <span className={`cwn-pill${it.pillCyan ? ' cwn-cyan' : ''}`}>{it.pill}</span> : null}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <button className="cw-nav-toggle" onClick={toggle} title={collapsed ? 'Expand' : 'Collapse'} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        <span className="cwn-toggle-label">Collapse</span>
      </button>

      <div className="cwn-profile">
        <div className="cwn-profile-row">
          <label className="cwn-avatar-wrap" title="Upload avatar">
            <span className="cwn-avatar"><span className="cwn-avatar-inner">{avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={avatar} alt="User avatar" /> : initials}</span></span>
            <span className="cwn-avatar-edit">✎</span>
            <input type="file" className="cwn-avatar-input" accept="image/png,image/jpeg,image/webp" onChange={onAvatar} />
          </label>
          <div className="cwn-profile-text">
            <div className="cwn-profile-name">{user.name}</div>
            <div className="cwn-profile-role">{user.role}</div>
            <div className="cwn-profile-status"><span className="cwn-dot" />On-call · 24/7</div>
          </div>
        </div>
        <div className="cwn-avatar-hint cwn-profile-text">Click the avatar to upload a photo. PNG / JPG / WebP · max 2&nbsp;MB.</div>
      </div>
    </aside>
  )
}
