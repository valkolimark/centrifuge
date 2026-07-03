// Typed accessors over the authoritative /data files. Components and schema
// builders read NAP, navigation, and brands ONLY through here — never by typing
// phone numbers, addresses, hours, or brand names by hand (CLAUDE.md rules 3 & 4).
import napJson from '@data/nap.json'
import navJson from '@data/navigation.json'
import brandsJson from '@data/oem-brands.json'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://centrifuge.com'
).replace(/\/$/, '')

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

// ── NAP ───────────────────────────────────────────────────────
export interface PhoneRole {
  number: string
  display: string
  role: string
  hoursAvailable?: string
}
export interface Location {
  id: string
  label: string
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  note?: string
  phone: string
  geo: string
}

export const nap = napJson as {
  organization: {
    name: string
    url: string
    foundingYear: number
    description: string
    email_leads: string[]
    public_email: string
  }
  phones: Record<string, PhoneRole>
  hours: {
    office: { days: string; opens: string; closes: string; display: string }
    oncall: { display: string; schemaContactOption: string }
    forbidden_legacy_string: string
  }
  locations: Location[]
}

export const org = nap.organization
export const phones = nap.phones
export const hours = nap.hours
export const locations = nap.locations

/** Phone by role key (main | emergency | chicago | houston). */
export function phone(role: keyof typeof phones): PhoneRole {
  const p = phones[role]
  if (!p) throw new Error(`Unknown phone role: ${role}`)
  return p
}

/** tel: href for a role's E.164 number. */
export function telHref(role: keyof typeof phones): string {
  return `tel:${phone(role).number}`
}

export const emergencyPhone = phones.emergency
export const mainPhone = phones.main

/** Location's role-phone object. */
export function locationPhone(loc: Location): PhoneRole {
  return phone(loc.phone as keyof typeof phones)
}

// ── Navigation ────────────────────────────────────────────────
export interface NavLeaf {
  label: string
  href: string
  external?: boolean
  style?: string
}
export interface NavGroup {
  heading: string
  items: NavLeaf[]
}
export type NavItem =
  | { label: string; type: 'megamenu'; groups?: NavGroup[]; featured_from?: string; footer_link?: NavLeaf }
  | { label: string; type: 'dropdown'; items: NavLeaf[] }
  | { label: string; href: string }

export const navigation = navJson as {
  header: NavItem[]
  header_utility: Array<{ label: string; phone?: string; href?: string; style: string; always_visible?: boolean }>
  mobile_menu_order: string[]
  footer: Record<string, unknown>
}

// ── Brands ────────────────────────────────────────────────────
export interface Brand {
  name: string
  slug: string
  legacy_slugs: string[]
  legacy_misspellings?: string[]
  featured?: boolean
  models_seen?: string[]
  note?: string
}

export const brands = (brandsJson as { brands: Brand[] }).brands
export const featuredBrands = brands.filter((b) => b.featured)

export function brandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}
