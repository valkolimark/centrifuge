import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { buildMetadata } from '@/lib/seo'
import { getHowItWorks } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  { title: 'How Centrifuges Work | Centrifuge World', description: 'Plain-language guides to how decanter, basket, disc-stack, pusher, peeler, and nozzle centrifuges work — and the signs each type needs repair.' },
  '/resources/how-it-works/',
)

export default async function HowItWorksIndex() {
  const items = await getHowItWorks()
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'How Centrifuges Work', url: '/resources/how-it-works/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>How centrifuges work</h1>
          <p className="mt-3 text-steel-700">Clear guides to each centrifuge type — how it separates, and how to tell when it needs service.</p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((h) => (
            <li key={h.slug}>
              <Link href={`/resources/how-it-works/${h.slug}/`} className="block h-full rounded-card border border-steel-300 bg-white p-5 hover:border-blue hover:shadow-md">
                <p className="font-semibold text-navy">{h.title}</p>
                {h.answerBox ? <p className="mt-1 line-clamp-3 text-sm text-steel-500">{h.answerBox}</p> : null}
                <span className="mt-3 inline-block text-sm font-semibold text-link">Read →</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner secondary={{ label: 'See our services', href: '/services/' }} />
    </SiteShell>
  )
}
