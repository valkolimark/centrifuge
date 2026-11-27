import type { CSSProperties } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { TrackedButtonLink } from '@/components/ui/TrackedButtonLink'

// Homepage feature bands that point to the interactive 3D models on the service pages.
// Static: poster images and a link — no 3D code loads here. Colour comes from the Web
// Blue ramp only (deep → navy → blue with a bright-blue glow). The two bands mirror each
// other (image right / image left) so they read as a pair rather than a repeat.
interface FeatureImage {
  src: string
  alt: string
  width: number
  height: number
}

interface Feature {
  heading: string
  body: string
  points: string[]
  cta: string
  href: string
  ctaLabel: string
  ctaLocation: string
  images: FeatureImage[]
  /** Image on the left, text on the right (lg and up). */
  mirrored: boolean
}

const FEATURES = {
  decanter: {
    heading: 'Take a decanter apart, part by part',
    body: 'Explore the rotating assembly of a decanter centrifuge in 3D: bowl, scroll conveyor, hubs, bearings, and gearbox. See how the parts fit together and what each one does.',
    points: ['Rotate it 360°', 'Fly it apart', 'Identify every part'],
    cta: 'Explore the 3D decanter',
    href: '/services/decanter-centrifuge-repair/#rotating-assembly',
    ctaLabel: 'Home — Explore the 3D decanter',
    ctaLocation: 'home_decanter_3d',
    images: [
      {
        src: '/images/decanter-3d/exploded.webp',
        alt: 'Exploded 3D view of a decanter centrifuge rotating assembly: gearbox, hubs, bowl, scroll conveyor, bearings, and feed tube laid out along the shaft axis',
        width: 1241,
        height: 452,
      },
    ],
    mirrored: false,
  },
  basket: {
    heading: 'See inside a basket centrifuge',
    body: 'Explore a complete vertical basket centrifuge in 3D, from the top drive and spindle bearings to the perforated basket, plow, and discharge chute. Switch between an electric and a hydraulic drive.',
    points: ['Fly it apart', 'Electric or hydraulic drive', 'Zoom in on any part'],
    cta: 'Explore the 3D basket centrifuge',
    href: '/services/basket-centrifuge-repair/#inside-the-machine',
    ctaLabel: 'Home — Explore the 3D basket centrifuge',
    ctaLocation: 'home_basket_3d',
    images: [
      {
        src: '/images/basket-3d/assembled.webp',
        alt: '3D render of a vertical basket centrifuge with a top-mounted drive and a sight glass on the lid',
        width: 672,
        height: 1146,
      },
      {
        src: '/images/basket-3d/exploded.webp',
        alt: 'The same basket centrifuge exploded vertically: motor, gearbox, pedestal, bearing housing and spindle, lid, basket, casing, and discharge chute',
        width: 414,
        height: 1150,
      },
    ],
    mirrored: true,
  },
} satisfies Record<string, Feature>

export function FlyApartFeature({ model }: { model: keyof typeof FEATURES }) {
  const f: Feature = FEATURES[model]
  const tall = f.images.length > 1

  return (
    <section
      className="relative isolate overflow-hidden py-[var(--space-8)] text-white"
      style={{
        background: f.mirrored
          ? 'linear-gradient(248deg, var(--color-blue-deep) 0%, var(--color-navy) 46%, var(--color-blue) 100%)'
          : 'linear-gradient(112deg, var(--color-blue-deep) 0%, var(--color-navy) 46%, var(--color-blue) 100%)',
      }}
    >
      {/* Decorative glows and rule — bright blue only, behind the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: f.mirrored
            ? 'radial-gradient(44% 70% at 24% 48%, color-mix(in srgb, var(--color-blue-bright) 46%, transparent) 0%, transparent 70%), radial-gradient(30% 45% at 94% 100%, color-mix(in srgb, var(--color-blue-mid) 30%, transparent) 0%, transparent 70%)'
            : 'radial-gradient(48% 70% at 74% 46%, color-mix(in srgb, var(--color-blue-bright) 46%, transparent) 0%, transparent 70%), radial-gradient(30% 45% at 8% 100%, color-mix(in srgb, var(--color-blue-mid) 30%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background: f.mirrored
            ? 'linear-gradient(270deg, var(--color-blue-bright), var(--color-blue-mid) 55%, transparent)'
            : 'linear-gradient(90deg, var(--color-blue-bright), var(--color-blue-mid) 55%, transparent)',
        }}
      />

      <div className="container-cw grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
        <div className={cn('reveal lg:col-span-5', f.mirrored && 'lg:order-2 lg:col-start-8')}>
          <p className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
            <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-blue-bright shadow-[0_0_10px_var(--color-blue-bright)]" />
            Interactive 3D
          </p>
          <h2 className="mt-4 text-white">{f.heading}</h2>
          <p className="mt-3 max-w-xl text-white/90">{f.body}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {f.points.map((p) => (
              <li key={p} className="rounded-pill bg-blue-deep/45 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15">
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <TrackedButtonLink href={f.href} variant="on-dark" size="lg" ctaLabel={f.ctaLabel} ctaLocation={f.ctaLocation}>
              {f.cta}
              <span aria-hidden="true">→</span>
            </TrackedButtonLink>
          </div>
        </div>

        <div
          className={cn('reveal', f.mirrored ? 'lg:order-1 lg:col-span-6' : 'lg:col-span-7')}
          style={{ '--reveal-index': 2 } as CSSProperties}
        >
          {tall ? (
            // Vertical machine: assembled and exploded side by side at a shared height.
            <div className="flex items-end justify-center gap-6 sm:gap-10">
              {f.images.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(max-width: 640px) 45vw, 280px"
                  className="h-[300px] w-auto drop-shadow-[0_24px_38px_rgb(0_10_16/0.55)] sm:h-[420px]"
                />
              ))}
            </div>
          ) : (
            <Image
              src={f.images[0].src}
              alt={f.images[0].alt}
              width={f.images[0].width}
              height={f.images[0].height}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="h-auto w-full drop-shadow-[0_24px_38px_rgb(0_10_16/0.55)]"
            />
          )}
        </div>
      </div>
    </section>
  )
}
