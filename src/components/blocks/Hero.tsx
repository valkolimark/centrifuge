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
}: {
  variant?: Variant
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  image?: { src: string; alt: string; width: number; height: number; priority?: boolean }
}) {
  const dark = variant !== 'interior'
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variant === 'home' && 'bg-blue-deep text-white',
        variant === 'emergency' && 'bg-safety text-white',
        variant === 'interior' && 'bg-steel-100 text-body',
      )}
    >
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={image.priority}
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className={cn('absolute inset-0', variant === 'emergency' ? 'bg-safety/70' : 'bg-blue-deep/70')} />
        </div>
      ) : null}

      <div className="container-cw relative py-[var(--space-9)]">
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
      </div>
    </section>
  )
}
