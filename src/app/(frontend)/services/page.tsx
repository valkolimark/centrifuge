import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ServiceGrid, type ServiceCardItem } from '@/components/blocks/ServiceCard'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { CTABanner } from '@/components/blocks/CTABanner'
import { getPayloadClient } from '@/lib/payload'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  {
    title: 'Centrifuge Repair & Rebuild Services | Centrifuge World',
    description:
      'Industrial centrifuge repair, rebuilds, balancing, inspections, parts fabrication, gearbox repair, field service, and 24/7 emergency service for 45+ OEM brands.',
  },
  '/services/',
)

async function getServices(): Promise<ServiceCardItem[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      limit: 100,
      depth: 0,
      sort: 'title',
    })
    return res.docs.map((d) => {
      const doc = d as { title: string; slug: string; answerBox?: string }
      return {
        title: doc.title,
        href: `/services/${doc.slug}/`,
        description: (doc.answerBox ?? '').split('. ')[0] + '.',
      }
    })
  } catch {
    return []
  }
}

export default async function ServicesIndexPage() {
  const services = await getServices()
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Services', url: '/services/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Centrifuge repair &amp; rebuild services</h1>
          <p className="mt-3 text-steel-700">
            One shop for inspection, repair, rebuilds, balancing, parts fabrication, gearbox work,
            field service, and 24/7 emergency response — across 45+ OEM brands.
          </p>
        </div>
        <div className="mt-8">
          <ServiceGrid items={services} />
        </div>
      </Section>
      <EmergencyCallout />
      <CTABanner secondary={{ label: 'Talk to a specialist', href: '/contact/' }} />
    </SiteShell>
  )
}
