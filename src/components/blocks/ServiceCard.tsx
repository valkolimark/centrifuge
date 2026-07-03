import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface ServiceCardItem {
  title: string
  href: string
  description: string
  icon?: ReactNode
}

export function ServiceCard({ item }: { item: ServiceCardItem }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'reveal group flex flex-col rounded-card border border-steel-300 bg-white p-5',
        'transition-[transform,box-shadow,border-color] duration-150 ease-out',
        'hover:-translate-y-0.5 hover:border-blue hover:shadow-md',
      )}
    >
      {item.icon ? (
        <span className="mb-3 grid h-10 w-10 place-items-center rounded-button bg-steel-100 text-blue">
          {item.icon}
        </span>
      ) : null}
      <h3 className="text-lg text-navy group-hover:text-blue">{item.title}</h3>
      <p className="mt-1.5 text-sm text-steel-500">{item.description}</p>
      <span className="mt-3 text-sm font-semibold text-link">Learn more →</span>
    </Link>
  )
}

export function ServiceGrid({ items }: { items: ServiceCardItem[] }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      style={{ ['--reveal-index' as string]: 0 }}
    >
      {items.map((item, i) => (
        <div key={item.href} style={{ ['--reveal-index' as string]: i }}>
          <ServiceCard item={item} />
        </div>
      ))}
    </div>
  )
}
