// Helpers for the interim industry/brand stub routes (Cycle 2). Full industry pages
// are authored in Cycle 4 and brand pages in Cycle 3; these keep internal links
// resolving (200) in the meantime.
import { navigation, brands, type NavItem } from '@/lib/site'

const industriesNav = navigation.header.find((i) => i.label === 'Industries') as Extract<
  NavItem,
  { type: 'dropdown' }
>

export const INDUSTRIES = industriesNav.items.map((it) => ({
  slug: it.href.replace(/^\/industries\//, '').replace(/\/$/, ''),
  label: it.label,
  href: it.href,
}))

export function industryBySlug(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug)
}

export function brandStubBySlug(slug: string) {
  return brands.find((b) => b.slug === slug)
}
