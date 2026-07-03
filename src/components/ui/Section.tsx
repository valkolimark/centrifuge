import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'default' | 'subtle' | 'navy' | 'deep'

const tones: Record<Tone, string> = {
  default: 'bg-white text-body',
  subtle: 'bg-steel-100 text-body',
  navy: 'bg-navy text-white',
  deep: 'bg-blue-deep text-white',
}

/** Full-bleed section with a centered container. */
export function Section({
  tone = 'default',
  as: As = 'section',
  className,
  containerClassName,
  children,
  id,
}: {
  tone?: Tone
  as?: ElementType
  className?: string
  containerClassName?: string
  children: ReactNode
  id?: string
}) {
  return (
    <As id={id} className={cn(tones[tone], 'py-[var(--space-8)]', className)}>
      <div className={cn('container-cw', containerClassName)}>{children}</div>
    </As>
  )
}

export function Container({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('container-cw', className)}>{children}</div>
}
