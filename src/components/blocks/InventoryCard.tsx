import Link from 'next/link'
import Image from 'next/image'
import { MACHINE_TYPE_LABELS, CONDITION_LABELS, type InventoryItem } from '@/lib/inventory'

// Shared inventory listing card — used on /inventory and on OEM brand pages (CYCLE-INV-1).
// Extracted verbatim from the inventory grid so both surfaces render identically.
export function priceLabel(item: InventoryItem): string {
  if (item.price && !item.priceOnRequest) return `$${item.price.toLocaleString('en-US')}`
  return 'Price on request'
}

export function InventoryCard({ item }: { item: InventoryItem }) {
  const img = item.images[0]
  return (
    <Link
      href={`/inventory/${item.slug}/`}
      className="group flex flex-col overflow-hidden rounded-card border border-steel-300 bg-white transition hover:border-blue hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-steel-100">
        {img ? (
          <Image src={img.url} alt={img.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-steel-500">Photo on request</div>
        )}
        {item.availability === 'sale-pending' ? (
          <span className="absolute left-3 top-3 rounded-button bg-navy px-2 py-1 text-xs font-semibold text-white">Sale pending</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{MACHINE_TYPE_LABELS[item.machineType] ?? 'Centrifuge'}</span>
          {item.condition ? <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{CONDITION_LABELS[item.condition] ?? item.condition}</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-navy group-hover:text-blue">{item.title}</h3>
        {item.shortDescription ? <p className="mt-2 line-clamp-3 text-sm text-steel-700">{item.shortDescription}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold text-navy">{priceLabel(item)}</span>
          <span className="text-sm font-semibold text-blue" aria-hidden="true">View details →</span>
        </div>
      </div>
    </Link>
  )
}
