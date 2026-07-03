import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LocationCard } from '@/components/blocks/LocationCard'
import { CTABanner } from '@/components/blocks/CTABanner'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { JsonLd } from '@/components/JsonLd'
import { localBusinessSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, locations } from '@/lib/site'

// Locations index. Cycle 4 adds per-location pages; this index + LocalBusiness
// schema is a real, indexable page now.
export const metadata: Metadata = buildMetadata(
  { title: 'Our Locations — Houston & Chicago | Centrifuge World', description: 'Centrifuge World operates three US facilities in Houston (Rosharon), TX and the Chicago area (Franklin Park and Alsip, IL), with nationwide field service.' },
  '/locations/',
)

export default function LocationsPage() {
  const schema = locations.map((loc) => localBusinessSchema(loc, `${SITE_URL}/locations/${loc.id}/`))
  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Locations', url: '/locations/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Our locations</h1>
          <p className="mt-3 text-steel-700">
            Three US facilities — Houston (Rosharon), TX and the Chicago area — with nationwide field
            service and a 24/7 emergency line.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {locations.map((loc) => (
            <LocationCard key={loc.id} loc={loc} />
          ))}
        </div>
      </Section>
      <EmergencyCallout />
      <CTABanner secondary={{ label: 'Contact us', href: '/contact-cw/' }} />
    </SiteShell>
  )
}
