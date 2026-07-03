import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  { title: 'Resources | Centrifuge World', description: 'Centrifuge World resources — repair videos, how centrifuges work, case studies, FAQs, and the blog.' },
  '/resources/',
)

// Videos are live now; the rest are authored in Cycle 5 (shown as coming soon so
// the nav/breadcrumb resolve without dead links).
const RESOURCES = [
  { label: 'How Centrifuges Work', href: '/resources/how-it-works/', desc: 'Plain-language guides by machine type.', live: true },
  { label: 'Case Studies', href: '/resources/case-studies/', desc: 'Documented rebuild projects.', live: true },
  { label: 'Blog', href: '/resources/blog/', desc: 'Guidance on repair, cost, and maintenance.', live: true },
  { label: 'FAQs', href: '/resources/faqs/', desc: 'Answers to common centrifuge questions.', live: true },
  { label: 'Videos', href: '/resources/videos/', desc: 'Shop tours and real repair & rebuild work.', live: true },
]

export default function ResourcesIndex() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Resources</h1>
          <p className="mt-3 text-steel-700">Videos, guides, and answers from our shop.</p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) =>
            r.live ? (
              <li key={r.href}>
                <Link href={r.href} className="block h-full rounded-card border border-steel-300 bg-white p-5 hover:border-blue hover:shadow-md">
                  <p className="font-semibold text-navy">{r.label}</p>
                  <p className="mt-1 text-sm text-steel-500">{r.desc}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-link">View →</span>
                </Link>
              </li>
            ) : (
              <li key={r.href} className="rounded-card border border-dashed border-steel-300 bg-steel-100 p-5">
                <p className="font-semibold text-navy">{r.label}</p>
                <p className="mt-1 text-sm text-steel-500">{r.desc}</p>
                <span className="mt-3 inline-block text-xs uppercase tracking-wide text-steel-500">Coming soon</span>
              </li>
            ),
          )}
        </ul>
      </Section>
      <CTABanner secondary={{ label: 'Contact us', href: '/contact-cw/' }} />
    </SiteShell>
  )
}
