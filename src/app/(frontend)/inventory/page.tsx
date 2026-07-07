import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { CTABanner } from '@/components/blocks/CTABanner'
import { ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { getInventory } from '@/lib/inventory'
import { InventoryCard } from '@/components/blocks/InventoryCard'

export const revalidate = 300
const HERO = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2020/01/07192807/sanborn-centrifuge-repair-hero-1.jpg.webp'

export const metadata: Metadata = buildMetadata(
  {
    title: 'Used Centrifuges in Stock | Inventory | Centrifuge World',
    description: 'Browse reconditioned used industrial centrifuges in stock at Centrifuge World — decanters, baskets, disc-stack separators, pushers & peelers, 45+ brands.',
  },
  '/inventory/',
)

export default async function InventoryPage() {
  const items = await getInventory()
  const schema = [
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Inventory', url: `${SITE_URL}/inventory/` },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Inventory', url: '/inventory/' }]} />

      <Hero
        variant="interior"
        eyebrow="Used centrifuges for sale"
        title="Used centrifuges in stock"
        subtitle="Reconditioned and tested machines, ready to install. New listings are added regularly — tell us what you need and we'll match it."
        image={{ src: HERO, alt: 'Reconditioned industrial centrifuges available from Centrifuge World', width: 1600, height: 900 }}
        actions={
          <>
            <ButtonLink href="/cw-ez-quote-for-sales/" variant="on-dark">
              Request a machine
            </ButtonLink>
            <ButtonLink href="/sell-your-centrifuge/" variant="outline-dark">
              Sell your centrifuge
            </ButtonLink>
          </>
        }
      />

      <Section>
        {items.length ? (
          <>
            <div className="mb-6 flex items-baseline justify-between">
              <h2>{items.length} machine{items.length === 1 ? '' : 's'} available</h2>
              <Link href="/used-centrifuges/" className="text-sm font-semibold text-link">
                Shop by type →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <InventoryCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl rounded-card border border-steel-300 bg-steel-100 p-8 text-center">
            <h2>Tell us what you&apos;re looking for</h2>
            <p className="mt-3 text-steel-700">
              Our stock of reconditioned centrifuges turns over quickly and we source from a nationwide buy network.
              Send your process details and we&apos;ll match a machine — decanter, basket, disc-stack, pusher, or peeler.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/cw-ez-quote-for-sales/">Request a machine</ButtonLink>
              <ButtonLink href="/used-centrifuges/" variant="secondary">
                Shop by type
              </ButtonLink>
            </div>
          </div>
        )}
      </Section>

      <CTABanner
        heading="Have a machine to sell?"
        body="We buy used centrifuges of most brands and conditions — running or not."
        primary={{ label: 'Sell your centrifuge', href: '/sell-your-centrifuge/' }}
        secondary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }}
      />
    </SiteShell>
  )
}
