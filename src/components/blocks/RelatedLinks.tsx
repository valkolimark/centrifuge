import Link from 'next/link'

// RelatedLinks: internal-link block. Enforces the internal-linking rule
// (services link >=2 siblings, >=2 brands, >=1 industry) by grouping.
export interface LinkGroup {
  heading: string
  links: { label: string; href: string }[]
}

export function RelatedLinks({ groups }: { groups: LinkGroup[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <div key={g.heading}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-steel-500">
            {g.heading}
          </h3>
          <ul className="space-y-1.5">
            {g.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-link hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
