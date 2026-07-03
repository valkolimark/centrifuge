import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
import { getInventory, MACHINE_TYPE_LABELS, CONDITION_LABELS, type InventoryItem } from '@/lib/inventory'

export const revalidate = 300
const HERO = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2020/01/07192807/sanborn-centrifuge-repair-hero-1.jpg.webp'

export const metadata: Metadata = buildMetadata(
  {
    title: 'Used Centrifuges in Stock | Inventory | Centrifuge World',
    description: 'Browse reconditioned used industrial centrifuges in stock at Centrifuge World — decanters, baskets, disc-stack separators, pushers & peelers, 45+ brands.',
  },
  '/inventory/',
)

function priceLabel(item: InventoryItem): string {
  if (item.price && !item.priceOnRequest) return `$${item.price.toLocaleString('en-US')}`
  return 'Price on request'
}

function InventoryCard({ item }: { item: InventoryItem }) {
  const img = item.images[0]
  return (
    <Link
      href={`/inventory/${item.slug}/`}
      className="group flex flex-col overflow-hidden rounded-card border border-steel-300 bg-white transition hover:border-blue hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-steel-100">
        {img ? (
          <Image src={img.url} alt={img.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-steel-500">Photo on request</div>
        )}
        {item.availability === 'sale-pending' ? (
          <span className="absolute left-3 top-3 rounded-button bg-navy px-2 py-1 text-xs font-semibold text-white">Sale pending</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{MACHINE_TYPE_LABELS[item.machineType] ?? 'Centrifuge'}</span>
          {item.condition ? <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{CONDITION_LABELS[item.condition] ?? item.condition}</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-navy group-hover:text-blue">{item.title}</h3>
        {item.shortDescription ? <p className="mt-2 line-clamp-3 text-sm text-steel-700">{item.shortDescription}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold text-navy">{priceLabel(item)}</span>
          <span className="text-sm font-semibold text-blue" aria-hidden="true">View details →</span>
        </div>
      </div>
    </Link>
  )
}

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
            <p className="mt-6 text-sm text-steel-500">
              You can also browse our{' '}
              <a href="https://inventory.centrifuge.com" className="text-link underline">
                full live inventory
              </a>
              .
            </p>
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
