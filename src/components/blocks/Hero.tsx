import type { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

type Variant = 'home' | 'interior' | 'emergency'

// Hero block, three variants. Emergency uses the emergency-red treatment.
// Pass an optional next/image (with explicit dims + alt) as `image`; when it is
// the LCP element the caller sets priority on it.
export function Hero({
  variant = 'interior',
  eyebrow,
  title,
  subtitle,
  actions,
  image,
  media,
}: {
  variant?: Variant
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  image?: { src: string; alt: string; width: number; height: number; priority?: boolean }
  /** Optional media (e.g. a video) rendered in a right column, top-aligned. */
  media?: ReactNode
}) {
  // Any hero with a background image sits on a dark overlay, so its text must be
  // white regardless of variant (fixes dark-navy text on a dark image = unreadable).
  const dark = variant !== 'interior' || !!image
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variant === 'home' && 'bg-blue-deep text-white',
        variant === 'emergency' && 'bg-safety text-white',
        variant === 'interior' && !image && 'bg-steel-100 text-body',
        variant === 'interior' && image && 'bg-blue-deep text-white',
      )}
    >
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            // The hero image is the above-the-fold LCP on every page → always high
            // priority (adds preload + fetchpriority=high).
            priority={image.priority ?? true}
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div
            className={cn(
              'absolute inset-0',
              variant === 'emergency'
                ? 'bg-safety/80'
                : 'bg-gradient-to-r from-blue-deep/90 via-blue-deep/75 to-blue-deep/55',
            )}
          />
        </div>
      ) : null}

      <div className="container-cw relative py-[var(--space-9)]">
        <div className={cn(media ? 'grid items-start gap-8 lg:grid-cols-2 lg:gap-12' : '')}>
          <div className="max-w-2xl">
            {eyebrow ? (
              <p
                className={cn(
                  'mb-3 text-sm font-semibold uppercase tracking-wide',
                  dark ? 'text-white/85' : 'text-blue',
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1 className={cn(dark && 'text-white')}>{title}</h1>
            {subtitle ? (
              <p className={cn('mt-4 text-lg', dark ? 'text-white/90' : 'text-steel-700')}>{subtitle}</p>
            ) : null}
            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {media ? <div className="w-full lg:justify-self-end">{media}</div> : null}
        </div>
      </div>
    </section>
  )
}
