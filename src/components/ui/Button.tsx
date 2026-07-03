import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'emergency' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-button ' +
  'transition-[background-color,color,box-shadow] duration-150 ease-out ' +
  'focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  // white text on blue — verified large-text contrast; buttons are >=16px semibold
  primary: 'bg-blue text-white hover:bg-navy shadow-sm',
  secondary: 'bg-white text-navy border border-steel-300 hover:border-navy hover:bg-steel-100',
  // safety orange is reserved exclusively for emergency CTAs / 24-7 line (CLAUDE.md)
  emergency: 'bg-safety text-white hover:brightness-95 shadow-sm font-bold',
  ghost: 'bg-transparent text-navy hover:bg-steel-100',
}

const sizes: Record<Size, string> = {
  md: 'text-[0.95rem] px-5 py-2.5 min-h-[44px]',
  lg: 'text-base px-6 py-3 min-h-[48px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  external,
  ...props
}: CommonProps & { href: string; external?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = cn(base, variants[variant], sizes[size], className)
  if (external || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
    return <a href={href} className={cls} {...props} />
  }
  return <Link href={href} className={cls} {...props} />
}
