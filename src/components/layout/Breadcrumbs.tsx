import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema, type Crumb } from '@/lib/schema'
import { absUrl } from '@/lib/seo'

// Breadcrumbs + BreadcrumbList schema (required on all non-home pages, DoD).
// Pass site-relative paths; schema uses absolute URLs.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const withHome: Crumb[] = items[0]?.name === 'Home' ? items : [{ name: 'Home', url: '/' }, ...items]
  const schemaCrumbs = withHome.map((c) => ({ name: c.name, url: absUrl(c.url) }))

  return (
    <nav aria-label="Breadcrumb" className="container-cw py-3 text-sm">
      <JsonLd data={breadcrumbSchema(schemaCrumbs)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-steel-500">
        {withHome.map((c, i) => {
          const last = i === withHome.length - 1
          return (
            <li key={c.url} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-steel-700">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.url} className="text-link hover:text-navy">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
