import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { INDUSTRIES } from '@/lib/stubs'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  { title: 'Industries We Serve | Centrifuge World', description: 'Centrifuge repair and rebuilds for rendering, wastewater, chemical, food & beverage, dairy, oil & gas, pharmaceutical, and mining operations.' },
  '/industries/',
)

export default function IndustriesIndex() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Industries', url: '/industries/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Industries we serve</h1>
          <p className="mt-3 text-steel-700">Centrifuge repair, rebuilds, and 24/7 service tailored to your process.</p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((i) => (
            <li key={i.slug}>
              <Link href={i.href} className="block rounded-card border border-steel-300 bg-white p-5 hover:border-blue hover:shadow-md">
                <span className="font-semibold text-navy">{i.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner />
    </SiteShell>
  )
}
