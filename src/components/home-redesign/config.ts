// Home page redesign (preview branch home-redesign-preview) switches.
// Each open decision for the owner is ONE constant here. Documented in
// /workspace/centrifuge-site-redesign/TOGGLES.md. Flip a value, rebuild, re-render.
import { locations, phones, type Location } from '@/lib/site'

/** D1 font. 'montserrat' = self-hosted Montserrat variable (brand guide, emails, landings).
 *  'site' = the current site pair (Archivo headings, Inter body) from the root layout. */
export const HOME_FONT: 'montserrat' | 'site' = 'montserrat'

/** D2 non-toll-free numbers. Owner rule: never remove non-toll-free numbers.
 *  true (default) keeps the 24/7 emergency 832-338-4990, Houston direct 832-743-1573 and the
 *  Chicago SMS "Text Us" link on the home page, in a quiet spot (Locations section).
 *  false hides them on the HOME PAGE ONLY. They stay in data/nap.json and on every other page. */
export const SHOW_LOCAL_NUMBERS = true

/** D3 third facility. COMPANY.md (Shared positioning + Locations) confirms Alsip, IL,
 *  12340 S Keeler Ave, Alsip, IL 60803, so the default is true. false shows Houston and
 *  Franklin Park only. Alsip stays in data/nap.json either way. */
export const SHOW_ALSIP = true

/** D5 FAQ. A short block near the bottom, live-site FAQ copy word for word. */
export const SHOW_FAQ = true
/** Which live-site FAQ entries to show, in order (keys of HOME_FAQ_BANK below). Cap 3. */
export const HOME_FAQ_KEYS: Array<keyof typeof HOME_FAQ_BANK> = ['whoRepairs', 'otherBrands']

/** D8 hero photo. 'w015' = Centrifuge_W-015 rotating assembly in the Review-cleared CW23 crop.
 *  'openedDecanter' = W-022 opened decanter (then S3 shows W-015 instead). */
export const HERO_PHOTO: 'w015' | 'openedDecanter' = 'w015'

/** D7 secondary action ("Send Us the Details"). Never submitted by Design. */
export const FORM_HREF = '/contact-cw/'

/** D4 logo. Only 'full-color' exists without ".com" (black wordmark, blue arrow), so it sits on
 *  white or tint only. A reverse logo needs a new BuzzCube export from cw-logos.ai. */
export const LOGO_VARIANT = 'full-color' as const

/** Hours line, dash free. Content's line, Review passed it word for word at 8:47 PM CT Nov 21, 2026.
 *  Same hours as the live site ("Mon–Fri: 6:00 AM – 6:00 PM · On-Call 24/7", data/nap.json, unchanged).
 *  No time zone, per Review. */
export const HOURS_LINE = 'Monday to Friday, 6 AM to 6 PM. On call 24/7.'

/** Social share image (og:image and twitter:image) for the HOME PAGE ONLY. /og-default.png 404s.
 *  'logo' (original white option) = public/og-home-cw-logo.png, 1200x630, the full-color CW logo (scaled only,
 *  not recolored or edited) centered on white. No machine photo while CW photo rights are held.
 *  'logoTint' (r2 default) = public/og-home-cw-logo-tint-520.png, same unaltered logo scaled to 520px,
 *  centered on #eef7fa, so it survives a centered square crop. The white 'logo' file is kept.
 *  'hero' = public/og-home-hero-w015.jpg, byte-identical to the Review-cleared CW23 W-015 crop
 *  (1240x771, sha e8a99cce3906). Use only after Mark clears the photo rights. */
export const OG_IMAGE: 'logo' | 'logoTint' | 'hero' = 'logoTint' as 'logo' | 'logoTint' | 'hero'
const OG_IMAGE_FILES = {
  logo: '/og-home-cw-logo.png',
  logoTint: '/og-home-cw-logo-tint-520.png',
  hero: '/og-home-hero-w015.jpg',
} as const
export const OG_IMAGE_PATH = OG_IMAGE_FILES[OG_IMAGE]

/** Rosharon address as COMPANY.md writes it, HOME PAGE ONLY. data/nap.json keeps
 *  "7650 CR 48, Unit C" for every other page and for schema. */
export const HOME_ADDRESS_OVERRIDE: Record<string, string> = {
  houston: '7650 CR 48 unit C, Rosharon, TX 77583',
}

/** Caption under each map image (Google basemap captures; Review requires attribution). */
export const MAP_CAPTION = 'Map data \u00a9 Google'

/** Primary CTA phone role in data/nap.json. 'main' = (800) 208-6075 toll-free. */
export const PRIMARY_PHONE_ROLE = 'main' as const

// ── derived helpers (no hand-typed numbers; everything comes from data/nap.json) ──
export const telOf = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`
export const smsOf = (n: string) => `sms:${n.replace(/[^+\d]/g, '')}`
export const primaryPhone = phones[PRIMARY_PHONE_ROLE]
/** "1 (800) 208-6075", the approved email/landing CTA form. */
export const primaryDisplay = `1 ${primaryPhone.display}`
export const primaryTel = telOf(primaryPhone.number)
/** "+ 1-773-617-0937", the approved email footer form for the Chicago line. */
export const chicagoDisplay = `+ 1-${phones.chicago.display}`

export const loc = (id: string): Location => {
  const l = locations.find((x) => x.id === id)
  if (!l) throw new Error(`Unknown location ${id}`)
  return l
}
export const addressLine = (l: Location) =>
  HOME_ADDRESS_OVERRIDE[l.id] ?? `${l.streetAddress}, ${l.addressLocality}, ${l.addressRegion} ${l.postalCode}`

/** Live-site FAQ copy (src/app/(frontend)/page.tsx on main, live centrifuge.com).
 *  Review (f05b6f0 verdict, Nov 21): whoRepairs first sentence changed to Review's exact wording,
 *  rest word for word; "What are signs..." dropped (no source backs the list). The 832-line and
 *  "fraction of replacement" entries are not used. */
export const HOME_FAQ_BANK = {
  whoRepairs: {
    question: 'Who repairs industrial centrifuges?',
    answer:
      'Centrifuge World has been in business since 1939. From three US facilities we service 45+ OEM brands with shop repair, field service, balancing, parts fabrication, and a 24/7 emergency line.',
  },
  otherBrands: {
    question: 'Do you work on brands other than the original manufacturer?',
    answer:
      'Yes. Centrifuge World is an independent repair and rebuild specialist servicing 45+ OEM brands, including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and Flottweg.',
  },
} as const
