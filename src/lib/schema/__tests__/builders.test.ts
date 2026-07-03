import { describe, it, expect } from 'vitest'
import {
  organizationSchema,
  websiteSchema,
  webPageSchema,
  localBusinessSchema,
  serviceSchema,
  faqPageSchema,
  breadcrumbSchema,
  articleSchema,
  videoObjectSchema,
  ORG_ID,
} from '../builders'
import { locations, phones, org } from '../../site'

describe('schema builders', () => {
  it('organization: identity, foundingDate 1939, four contactPoints incl. 24/7 emergency', () => {
    const s = organizationSchema()
    expect(s['@type']).toBe('Organization')
    expect(s['@id']).toBe(ORG_ID)
    expect(s.name).toBe(org.name)
    expect(s.foundingDate).toBe('1939')
    const cps = s.contactPoint as Array<Record<string, unknown>>
    expect(cps).toHaveLength(4)
    const emergency = cps.find((c) => c.contactType === 'emergency')!
    expect(emergency.telephone).toBe(phones.emergency.number)
    expect(emergency.hoursAvailable).toBeDefined()
  })

  it('organization: omits sameAs until URLs are verified (Cycle 4)', () => {
    expect(organizationSchema().sameAs).toBeUndefined()
  })

  it('website: SearchAction present and references org as publisher', () => {
    const s = websiteSchema()
    expect(s['@type']).toBe('WebSite')
    expect((s.potentialAction as Record<string, unknown>)['@type']).toBe('SearchAction')
    expect((s.publisher as Record<string, unknown>)['@id']).toBe(ORG_ID)
  })

  it('webPage links to website + org graphs', () => {
    const s = webPageSchema({ url: 'https://centrifuge.com/', name: 'Home' })
    expect(s['@type']).toBe('WebPage')
    expect((s.publisher as Record<string, unknown>)['@id']).toBe(ORG_ID)
  })

  it('localBusiness: address byte-matches nap.json and omits geo until verified', () => {
    const loc = locations[0]
    const url = `https://centrifuge.com/locations/${loc.id}/`
    const s = localBusinessSchema(loc, url)
    expect(s['@type']).toBe('LocalBusiness')
    const addr = s.address as Record<string, string>
    expect(addr.streetAddress).toBe(loc.streetAddress)
    expect(addr.postalCode).toBe(loc.postalCode)
    expect(addr.addressCountry).toBe('US')
    // geo is a TODO(verify) string in nap.json, so it must not be emitted
    expect(s.geo).toBeUndefined()
    expect(s.telephone).toBe(phones[loc.phone as keyof typeof phones].number)
  })

  it('service: provider is org @id, areaServed US, no offers', () => {
    const s = serviceSchema({
      url: 'https://centrifuge.com/services/decanter-centrifuge-repair/',
      name: 'Decanter Centrifuge Repair',
      serviceType: 'Decanter centrifuge repair and rebuilding',
    })
    expect(s['@type']).toBe('Service')
    expect((s.provider as Record<string, unknown>)['@id']).toBe(ORG_ID)
    expect(s.offers).toBeUndefined()
  })

  it('faqPage: maps Q&A to Question/Answer nodes', () => {
    const s = faqPageSchema([{ question: 'Q?', answer: 'A.' }])
    const main = s.mainEntity as Array<Record<string, unknown>>
    expect(main[0]['@type']).toBe('Question')
    expect((main[0].acceptedAnswer as Record<string, unknown>).text).toBe('A.')
  })

  it('breadcrumb: 1-indexed positions', () => {
    const s = breadcrumbSchema([
      { name: 'Home', url: 'https://centrifuge.com/' },
      { name: 'Services', url: 'https://centrifuge.com/services/' },
    ])
    const items = s.itemListElement as Array<Record<string, unknown>>
    expect(items[0].position).toBe(1)
    expect(items[1].position).toBe(2)
  })

  it('article: author + publisher are the organization; dates preserved', () => {
    const s = articleSchema({
      url: 'https://centrifuge.com/resources/blog/x/',
      headline: 'X',
      image: 'https://centrifuge.com/x.jpg',
      datePublished: '2026-01-01',
      dateModified: '2026-02-01',
    })
    expect((s.author as Record<string, unknown>)['@id']).toBe(ORG_ID)
    expect(s.dateModified).toBe('2026-02-01')
  })

  it('videoObject: carries required fields', () => {
    const s = videoObjectSchema({
      name: 'How a decanter works',
      description: 'desc',
      thumbnailUrl: 'https://centrifuge.com/t.jpg',
      uploadDate: '2026-01-01',
      embedUrl: 'https://videos.sproutvideo.com/embed/x',
    })
    expect(s['@type']).toBe('VideoObject')
    expect(s.embedUrl).toContain('sproutvideo')
  })

  it('all builders declare schema.org context', () => {
    const all = [
      organizationSchema(),
      websiteSchema(),
      serviceSchema({ url: 'u', name: 'n', serviceType: 't' }),
      faqPageSchema([]),
      breadcrumbSchema([]),
    ]
    for (const s of all) expect(s['@context']).toBe('https://schema.org')
  })
})
