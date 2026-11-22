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
export const HOME_FAQ_KEYS: Array<keyof typeof HOME_FAQ_BANK> = ['whoRepairs', 'otherBrands', 'signs']

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
  `${l.streetAddress}, ${l.addressLocality}, ${l.addressRegion} ${l.postalCode}`

/** Live-site FAQ copy, word for word (src/app/(frontend)/page.tsx on main, live centrifuge.com).
 *  Not yet Review-cleared for the redesigned page. Entries with the 832 line or the
 *  "fraction of replacement" claim are left out of the default selection. */
export const HOME_FAQ_BANK = {
  whoRepairs: {
    question: 'Who repairs industrial centrifuges?',
    answer:
      'Centrifuge World has repaired and rebuilt industrial centrifuges since 1939. From three US facilities we service 45+ OEM brands with shop repair, field service, balancing, parts fabrication, and a 24/7 emergency line.',
  },
  otherBrands: {
    question: 'Do you work on brands other than the original manufacturer?',
    answer:
      'Yes. Centrifuge World is an independent repair and rebuild specialist servicing 45+ OEM brands, including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and Flottweg.',
  },
  signs: {
    question: 'What are signs a centrifuge needs repair?',
    answer:
      'Common indicators include vibration, bearing noise or heat, reduced separation quality, scroll or conveyor wear, leaks, gearbox issues, and amperage spikes.',
  },
} as const
