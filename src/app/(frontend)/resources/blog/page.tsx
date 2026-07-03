import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CTABanner } from '@/components/blocks/CTABanner'
import { buildMetadata } from '@/lib/seo'
import { getBlogPosts } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  { title: 'Centrifuge Repair Blog | Centrifuge World', description: 'Guidance on industrial centrifuge repair cost, warning signs, emergency response, and inspections from Centrifuge World.' },
  '/resources/blog/',
)

export default async function BlogIndex() {
  const posts = await getBlogPosts()
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'Blog', url: '/resources/blog/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Blog</h1>
          <p className="mt-3 text-steel-700">Practical guidance on centrifuge repair, cost, maintenance, and emergencies.</p>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/resources/blog/${p.slug}/`} className="block h-full overflow-hidden rounded-card border border-steel-300 bg-white hover:border-blue hover:shadow-md">
                {p.hero ? (
                  <Image src={p.hero.src} alt={p.hero.alt} width={800} height={500} sizes="(max-width:1024px) 100vw, 33vw" className="aspect-[16/10] w-full object-cover" />
                ) : null}
                <div className="p-4">
                  <p className="font-semibold text-navy">{p.title}</p>
                  {p.excerpt ? <p className="mt-1 line-clamp-3 text-sm text-steel-500">{p.excerpt}</p> : null}
                  <span className="mt-3 inline-block text-sm font-semibold text-link">Read →</span>
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
