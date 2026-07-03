// Typed JSON-LD builders (task 1.6) implementing data/schema-map.md.
// All NAP is pulled from src/lib/site (which reads data/nap.json) — never hand-typed.
// Never hand-write JSON-LD in page files; compose these and emit via <JsonLd>.
import { SITE_URL, org, phones, hours, locations, type Location } from '../site'

export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

type Json = Record<string, unknown>

/** sameAs URLs are TODO(verify: exact social URLs, Cycle 4). Empty until confirmed. */
const SAME_AS: string[] = []

function contactPoints(): Json[] {
  return [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: phones.main.number,
      areaServed: 'US',
      availableLanguage: 'en',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'emergency',
      telephone: phones.emergency.number,
      areaServed: 'US',
      availableLanguage: 'en',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: phones.chicago.number,
      areaServed: 'US',
      availableLanguage: 'en',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: phones.houston.number,
      areaServed: 'US',
      availableLanguage: 'en',
    },
  ]
}

export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: org.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo/cw-logo-black.webp`,
    description: org.description,
    foundingDate: String(org.foundingYear),
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
    contactPoint: contactPoints(),
  }
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: org.name,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/brands/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function webPageSchema(input: { url: string; name: string; description?: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
  }
}

function openingHours(): Json {
  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: hours.office.opens,
    closes: hours.office.closes,
  }
}

/** Generic LocalBusiness per schema-map (NOT a construction-business subtype). */
export function localBusinessSchema(loc: Location, url: string): Json {
  const rolePhone = phones[loc.phone as keyof typeof phones]
  const geoKnown = typeof loc.geo === 'object'
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#localbusiness`,
    name: `${org.name} — ${loc.label}`,
    url,
    parentOrganization: { '@id': ORG_ID },
    telephone: rolePhone?.number,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.streetAddress,
      addressLocality: loc.addressLocality,
      addressRegion: loc.addressRegion,
      postalCode: loc.postalCode,
      addressCountry: 'US',
    },
    openingHoursSpecification: openingHours(),
    areaServed: { '@type': 'Country', name: 'US' },
    // geo intentionally omitted until coordinates verified (Cycle 4). geoKnown guards it.
    ...(geoKnown ? { geo: loc.geo } : {}),
  }
}

export function serviceSchema(input: {
  url: string
  name: string
  serviceType: string
  description?: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${input.url}#service`,
    name: input.name,
    serviceType: input.serviceType,
    ...(input.description ? { description: input.description } : {}),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'US' },
    url: input.url,
  }
}

export interface QA {
  question: string
  answer: string
}

export function faqPageSchema(items: QA[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  }
}

export interface Crumb {
  name: string
  url: string
}

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}

export function articleSchema(input: {
  url: string
  headline: string
  description?: string
  image: string
  datePublished: string
  dateModified: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${input.url}#article`,
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    image: input.image,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: input.url,
  }
}

export function videoObjectSchema(input: {
  name: string
  description: string
  thumbnailUrl: string
  embedUrl: string
  // Optional: Google prefers uploadDate for rich results, but we don't fabricate
  // it — supply the real date (TODO(verify)) to enable the rich result.
  uploadDate?: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    ...(input.uploadDate ? { uploadDate: input.uploadDate } : {}),
    embedUrl: input.embedUrl,
  }
}

/** Convenience: the two site-wide graphs emitted from the root layout. */
export function siteWideSchemas(): Json[] {
  return [organizationSchema(), websiteSchema()]
}

export { locations }
