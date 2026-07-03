import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { buildMetadata } from '@/lib/seo'
import { getCaseStudies } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  { title: 'Centrifuge Rebuild Case Studies | Centrifuge World', description: 'Documented industrial centrifuge rebuild projects — decanter, Bird, Alfa Laval, Centrisys, and Sharples machines restored by Centrifuge World.' },
  '/resources/case-studies/',
)

export default async function CaseStudiesIndex() {
  const studies = await getCaseStudies()
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'Case Studies', url: '/resources/case-studies/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Case studies</h1>
          <p className="mt-3 text-steel-700">Real centrifuge rebuild projects from our shop. Client names are kept confidential.</p>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((c) => (
            <li key={c.slug}>
              <Link href={`/resources/case-studies/${c.slug}/`} className="block h-full overflow-hidden rounded-card border border-steel-300 bg-white hover:border-blue hover:shadow-md">
                {c.hero ? (
                  <Image src={c.hero.src} alt={c.hero.alt} width={800} height={500} sizes="(max-width:1024px) 100vw, 33vw" className="aspect-[16/10] w-full object-cover" />
                ) : null}
                <div className="p-4">
                  <p className="text-sm text-steel-500">{c.clientIndustry}</p>
                  <p className="mt-1 font-semibold text-navy">{c.title}</p>
                  {c.machineBrandModel ? <p className="mt-1 text-sm text-steel-500">{c.machineBrandModel}</p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner secondary={{ label: 'See our services', href: '/services/' }} />
    </SiteShell>
  )
}
