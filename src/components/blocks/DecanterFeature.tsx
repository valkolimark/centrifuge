import type { CSSProperties } from 'react'
import Image from 'next/image'
import { TrackedButtonLink } from '@/components/ui/TrackedButtonLink'

// Homepage feature band that points to the interactive 3D decanter on the decanter
// repair page. Static: one poster image and a link — no 3D code loads here.
// Colour comes from the Web Blue ramp only (deep → navy → blue with a bright-blue glow).
export const DECANTER_3D_HREF = '/services/decanter-centrifuge-repair/#rotating-assembly'

const EXPLODED = {
  src: '/images/decanter-3d/exploded.webp',
  alt: 'Exploded 3D view of a decanter centrifuge rotating assembly: gearbox, hubs, bowl, scroll conveyor, bearings, and feed tube laid out along the shaft axis',
  width: 1241,
  height: 452,
}

const POINTS = ['Rotate it 360°', 'Fly it apart', 'Identify every part']

export function DecanterFeature() {
  return (
    <section
      className="relative isolate overflow-hidden py-[var(--space-8)] text-white"
      style={{
        background:
          'linear-gradient(112deg, var(--color-blue-deep) 0%, var(--color-navy) 46%, var(--color-blue) 100%)',
      }}
    >
      {/* Decorative glows and rule — bright blue only, behind the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(48% 70% at 74% 46%, color-mix(in srgb, var(--color-blue-bright) 46%, transparent) 0%, transparent 70%), radial-gradient(30% 45% at 8% 100%, color-mix(in srgb, var(--color-blue-mid) 30%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background: 'linear-gradient(90deg, var(--color-blue-bright), var(--color-blue-mid) 55%, transparent)',
        }}
      />

      <div className="container-cw grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
        <div className="reveal lg:col-span-5">
          <p className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
            <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-blue-bright shadow-[0_0_10px_var(--color-blue-bright)]" />
            Interactive 3D
          </p>
          <h2 className="mt-4 text-white">Take a decanter apart, part by part</h2>
          <p className="mt-3 max-w-xl text-white/90">
            Explore the rotating assembly of a decanter centrifuge in 3D: bowl, scroll conveyor, hubs, bearings,
            and gearbox. See how the parts fit together and what each one does.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {POINTS.map((p) => (
              <li key={p} className="rounded-pill bg-blue-deep/45 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15">
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <TrackedButtonLink
              href={DECANTER_3D_HREF}
              variant="on-dark"
              size="lg"
              ctaLabel="Home — Explore the 3D decanter"
              ctaLocation="home_decanter_3d"
            >
              Explore the 3D decanter
              <span aria-hidden="true">→</span>
            </TrackedButtonLink>
          </div>
        </div>

        <div className="reveal lg:col-span-7" style={{ '--reveal-index': 2 } as CSSProperties}>
          <Image
            src={EXPLODED.src}
            alt={EXPLODED.alt}
            width={EXPLODED.width}
            height={EXPLODED.height}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="h-auto w-full drop-shadow-[0_24px_38px_rgb(0_10_16/0.55)]"
          />
        </div>
      </div>
    </section>
  )
}
