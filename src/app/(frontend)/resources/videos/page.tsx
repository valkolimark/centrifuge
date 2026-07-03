import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { VideoFacade } from '@/components/blocks/VideoFacade'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { videoObjectSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { CHANNEL_VIDEOS, CHANNEL_URL, toVideoSource, youtubeEmbedUrl } from '@/lib/videos'

export const metadata: Metadata = buildMetadata(
  {
    title: 'Centrifuge Repair Videos | Centrifuge World',
    description:
      'Shop tours and centrifuge repair videos from Centrifuge World — decanter, basket, disc-stack, and brand-specific rebuilds for Sharples, Alfa Laval, Westfalia, Andritz, and more.',
  },
  '/resources/videos/',
)

export default function VideosPage() {
  const schema = [
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Resources', url: `${SITE_URL}/resources/` },
      { name: 'Videos', url: `${SITE_URL}/resources/videos/` },
    ]),
    ...CHANNEL_VIDEOS.map((v) =>
      videoObjectSchema({
        name: `${v.title} — Centrifuge World`,
        description: `${v.title} — industrial centrifuge repair and rebuilds by Centrifuge World.`,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        embedUrl: youtubeEmbedUrl(v.id),
      }),
    ),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'Videos', url: '/resources/videos/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Videos</h1>
          <p className="mt-3 text-steel-700">
            Shop tours and real centrifuge repair and rebuild work from our floor. Videos load only
            when you press play. See more on our{' '}
            <a href={CHANNEL_URL} className="text-link underline" target="_blank" rel="noopener noreferrer">
              YouTube channel
            </a>
            .
          </p>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNEL_VIDEOS.map((v) => (
            <li key={v.id}>
              <VideoFacade video={toVideoSource(v)} />
              <p className="mt-2 text-sm font-medium text-navy">{v.title}</p>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner secondary={{ label: 'Talk to a specialist', href: '/contact-cw/' }} />
    </SiteShell>
  )
}
