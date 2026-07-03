import Link from 'next/link'
import { featuredBrands } from '@/lib/site'

// LogoRow: brand lockups. We never fabricate OEM logos — until hosted logos exist
// (harvested in Cycle 3) this renders accessible text lockups linking to brand pages.
export function LogoRow({
  brands = featuredBrands.map((b) => ({ name: b.name, slug: b.slug })),
}: {
  brands?: { name: string; slug: string }[]
}) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {brands.map((b) => (
        <li key={b.slug}>
          <Link
            href={`/brands/${b.slug}/`}
            className="inline-flex items-center rounded-button border border-steel-300 bg-white px-4 py-2 font-heading text-sm font-semibold text-navy hover:border-blue hover:text-blue"
          >
            {b.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
