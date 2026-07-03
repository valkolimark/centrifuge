import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { brands, featuredBrands } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

// Interim brands index (Cycle 2). The full A–Z filterable library is Cycle 3.
export const metadata: Metadata = buildMetadata(
  { title: 'Centrifuge Repair by Brand — 45+ OEMs | Centrifuge World', description: 'Independent repair and rebuilding for 45+ centrifuge brands including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and Flottweg.' },
  '/brands/',
)

export default function BrandsIndex() {
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Brands', url: '/brands/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Centrifuge repair by brand</h1>
          <p className="mt-3 text-steel-700">
            We are an independent specialist servicing 45+ OEM centrifuge brands. Featured brands:{' '}
            {featuredBrands.map((b) => b.name).join(', ')}.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((b) => (
            <li key={b.slug}>
              <Link href={`/brands/${b.slug}/`} className="block rounded-button border border-steel-300 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-blue hover:text-blue">
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner />
    </SiteShell>
  )
}
