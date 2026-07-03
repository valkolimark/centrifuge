import Link from 'next/link'
import { navigation, featuredBrands, locations, locationPhone, hours, org, type NavItem } from '@/lib/site'
import { PhoneLink } from '@/components/ui/PhoneLink'

function servicesLeaves() {
  const services = navigation.header.find((i) => i.label === 'Services') as Extract<NavItem, { type: 'megamenu' }>
  const all = services.groups?.flatMap((g) => g.items) ?? []
  return all.filter((l) => !l.external).slice(0, 8)
}

function industriesLeaves() {
  const ind = navigation.header.find((i) => i.label === 'Industries') as Extract<NavItem, { type: 'dropdown' }>
  return ind.items
}

const companyLinks = [
  { label: 'About', href: '/about/' },
  { label: 'Locations', href: '/locations/' },
  { label: 'Case Studies', href: '/resources/case-studies/' },
  { label: 'Blog', href: '/resources/blog/' },
  { label: 'FAQs', href: '/resources/faqs/' },
  { label: 'Contact', href: '/contact-cw/' },
  { label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' },
  { label: 'Sell Your Centrifuge', href: '/sell-your-centrifuge/' },
]

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-300">{heading}</h2>
      {children}
    </div>
  )
}

const linkCls = 'text-steel-100/90 hover:text-white text-sm'

export function Footer() {
  return (
    <footer id="site-footer" className="bg-blue-deep text-white">
      <div className="container-cw py-[var(--space-8)]">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <FooterCol heading="Services">
            <ul className="space-y-1.5">
              {servicesLeaves().map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services/" className="text-sm font-semibold text-white">
                  View All Services →
                </Link>
              </li>
            </ul>
          </FooterCol>

          <FooterCol heading="Brands">
            <ul className="space-y-1.5">
              {featuredBrands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}/`} className={linkCls}>
                    {b.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/brands/" className="text-sm font-semibold text-white">
                  All 45+ Brands →
                </Link>
              </li>
            </ul>
          </FooterCol>

          <FooterCol heading="Industries">
            <ul className="space-y-1.5">
              {industriesLeaves().map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol heading="Company">
            <ul className="space-y-1.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol heading="Locations">
            <ul className="space-y-4">
              {locations.map((loc) => {
                const p = locationPhone(loc)
                return (
                  <li key={loc.id} className="text-sm not-italic">
                    <p className="font-semibold text-white">{loc.label}</p>
                    <p className="text-steel-100/80">
                      {loc.streetAddress}
                      <br />
                      {loc.addressLocality}, {loc.addressRegion} {loc.postalCode}
                    </p>
                    <PhoneLink role={loc.phone} className="text-blue-100 text-white underline underline-offset-2">
                      {p.display}
                    </PhoneLink>
                  </li>
                )
              })}
            </ul>
          </FooterCol>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-sm text-steel-100/80">
          <p className="mb-2">
            {hours.office.display} · {hours.oncall.display}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacy-policy/" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use/" className="hover:text-white">
              Terms of Use
            </Link>
            <a href="/sitemap.xml" className="hover:text-white">
              Sitemap
            </a>
            <span>© {org.name} · Since {org.foundingYear}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
