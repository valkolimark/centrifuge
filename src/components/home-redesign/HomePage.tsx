import Image from 'next/image'
import Link from 'next/link'
import { featuredBrands, phones } from '@/lib/site'
import { INDUSTRIES } from '@/lib/stubs'
import { HomeHeader, type HomeNavItem } from './HomeHeader'
import { StickyCallBar } from './StickyCallBar'
import { TelLink } from './TelLink'
import { montserrat } from './font'
import {
  FORM_HREF,
  HERO_PHOTO,
  HOME_FAQ_BANK,
  HOME_FAQ_KEYS,
  HOME_FONT,
  HOURS_LINE,
  MAP_CAPTION,
  PRIMARY_PHONE_ROLE,
  SHOW_ALSIP,
  SHOW_FAQ,
  SHOW_LOCAL_NUMBERS,
  addressLine,
  chicagoDisplay,
  loc,
  primaryDisplay,
} from './config'
import heroW015 from './img/hero-w015-1240.jpg'
import openedDecanter from './img/opened-decanter-880.jpg'
import bowlBefore from './img/bowl-before-900.jpg'
import bowlAfter from './img/bowl-after-900.jpg'
import mapHouston from './img/map-houston.webp'
import mapChicago from './img/map-chicago.webp'
import logo from './img/cw-logo-full-color.png'
import './home.css'

// Approved alts (CW23 / CW30 landings, landing-rev7c). Never "illustration".
const PHOTOS = {
  w015: { src: heroW015, alt: 'Decanter centrifuge rotating assembly on a shop stand' },
  openedDecanter: { src: openedDecanter, alt: 'Decanter centrifuge with its casing opened on a blue base' },
}
const heroPhoto = PHOTOS[HERO_PHOTO]
const sidePhoto = HERO_PHOTO === 'w015' ? PHOTOS.openedDecanter : PHOTOS.w015

const NAV: HomeNavItem[] = [
  {
    label: 'Services',
    href: '/services/',
    items: [
      { label: 'Centrifuge Repair', href: '/services/centrifuge-repair/' },
      { label: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/' },
      { label: 'Decanter Centrifuge Repair', href: '/services/decanter-centrifuge-repair/' },
      { label: 'Balancing & Testing', href: '/services/balancing-testing/' },
      { label: 'Parts & Fabrication', href: '/services/parts-fabrication/' },
      { label: 'Field Service', href: '/services/field-service/' },
      { label: '24/7 Emergency Service', href: '/services/emergency-centrifuge-service/' },
      { label: 'View All Services', href: '/services/' },
    ],
  },
  {
    label: 'Brands',
    href: '/brands/',
    items: [
      ...featuredBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}/` })),
      { label: 'All Brands', href: '/brands/' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries/',
    items: [...INDUSTRIES.map((i) => ({ label: i.label, href: i.href })), { label: 'All Industries', href: '/industries/' }],
  },
  { label: 'Used Centrifuges', href: '/used-centrifuges/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact-cw/' },
]

const SERVICES = [
  { label: 'Balancing', href: '/services/balancing-testing/' },
  { label: 'Repair and rebuild', href: '/services/' },
  { label: 'Centrifuge parts', href: '/services/parts-fabrication/' },
  { label: 'Field service', href: '/services/field-service/' },
  { label: '24/7 service', href: '/services/emergency-centrifuge-service/' },
  { label: 'All services', href: '/services/' },
]

const FACTS = [
  'Since 1939',
  'More than 45 centrifuge brands',
  'Decanter, basket, disc-stack, pusher and peeler',
  'Houston and the Chicago area',
]

const READY = [
  'Centrifuge brand and type',
  'Model and serial number from the nameplate',
  'What it is doing, and when it started',
  'Where the machine is (city and state)',
]

function CallButton({ id }: { id?: string }) {
  return (
    <TelLink id={id} role={PRIMARY_PHONE_ROLE} className="cwh-btn cwh-btn-call cwh-btn-lg">
      <span className="cwh-nw">Call Centrifuge World:</span>{' '}
      <span className="cwh-nw cwh-num">{primaryDisplay}</span>
    </TelLink>
  )
}

export function HomePage() {
  const houston = loc('houston')
  const franklin = loc('franklin-park')
  const alsip = loc('alsip')
  const fontClass = HOME_FONT === 'montserrat' ? `${montserrat.variable} cwh-font-m` : 'cwh-font-site'

  return (
    <div className={`cwh ${fontClass}`}>
      {HOME_FONT === 'montserrat' ? (
        // The root layout's skip link sits outside .cwh; give it the same family on this page.
        <style>{`body:has(.cwh-font-m) .skip-link{font-family:${montserrat.style.fontFamily}}`}</style>
      ) : null}
      <HomeHeader nav={NAV} />

      <main id="main">
        {/* S1 hero: navy card + plain photo. No text on the photo. */}
        <section className="cwh-hero" aria-labelledby="cwh-h1">
          <div className="cwh-wrap cwh-hero-grid">
            <div className="cwh-card cwh-enter">
              <span className="cwh-shape cwh-shape-plum" aria-hidden="true" />
              <p className="cwh-label cwh-eyebrow">Industrial centrifuge repair &amp; rebuilds since 1939</p>
              <h1 id="cwh-h1">
                Keep your centrifuges <em>running.</em>
              </h1>
              <p className="cwh-lede">Centrifuge World balances, repairs and rebuilds centrifuges.</p>
              <p className="cwh-label cwh-tf">Call toll-free</p>
              <CallButton id="cwh-herocall" />
              <p className="cwh-sec-wrap">
                <Link className="cwh-sec" href={FORM_HREF}>
                  Send Us the Details
                </Link>
              </p>
            </div>
            <div className="cwh-photo-wrap cwh-enter cwh-enter-2">
              <span className="cwh-shape cwh-shape-aqua" aria-hidden="true" />
              <div className="cwh-photo">
                <Image
                  src={heroPhoto.src}
                  alt={heroPhoto.alt}
                  priority
                  sizes="(min-width: 1200px) 640px, (min-width: 768px) 54vw, calc(100vw - 32px)"
                  quality={75}
                />
              </div>
            </div>
          </div>
        </section>

        {/* S2 fact strip (verified wording only). design-trends R24 one-rule stagger. */}
        <div className="cwh-facts">
          <ul className="cwh-wrap">
            {FACTS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        {/* S3 what we do */}
        <section className="cwh-blk" aria-labelledby="cwh-does">
          <div className="cwh-wrap cwh-two">
            <div className="cwh-prose">
              <h2 id="cwh-does">What Centrifuge World Does</h2>
              <ul className="cwh-ticks">
                {SERVICES.map((s) => (
                  <li key={s.label}>
                    <Link href={s.href}>{s.label}</Link>
                  </li>
                ))}
              </ul>
              <h2>Centrifuge Types and Brands</h2>
              <p>Decanter, basket, disc-stack, pusher and peeler centrifuges.</p>
              <p>
                More than 45 brands, including Alfa Laval, Andritz, Bird, Broadbent, Centrisys, Flottweg, GEA
                Westfalia, Hutchison Hayes, Sharples, Tolhurst, Aldec and Ametek.
              </p>
              <p className="cwh-more">
                <Link href="/brands/">All brands</Link>
              </p>
              <h2>Industries We Serve</h2>
              <p>Oil and gas, food and beverage, chemical, pharmaceutical, wastewater, mining, dairy and rendering.</p>
            </div>
            <div className="cwh-photo cwh-side-photo">
              <Image src={sidePhoto.src} alt={sidePhoto.alt} sizes="(min-width: 900px) 460px, calc(100vw - 32px)" />
            </div>
          </div>
        </section>

        {/* S4 before and after (approved CW30 pair and sentence; no labels on photos, no slider) */}
        <section className="cwh-blk cwh-tint" aria-labelledby="cwh-ba">
          <div className="cwh-wrap">
            <h2 id="cwh-ba">Decanter Bowls, Before and After Rebuild</h2>
            <div className="cwh-pair">
              <div className="cwh-photo">
                <Image
                  src={bowlBefore}
                  alt="Decanter bowl with a worn, discolored surface lying in an open wooden crate"
                  sizes="(min-width: 1200px) 576px, (min-width: 600px) 46vw, calc(100vw - 32px)"
                />
              </div>
              <div className="cwh-photo">
                <Image
                  src={bowlAfter}
                  alt="Decanter bowl with bright machined metal surfaces and an orange drive pulley lying in a wooden crate"
                  sizes="(min-width: 1200px) 576px, (min-width: 600px) 46vw, calc(100vw - 32px)"
                />
              </div>
            </div>
            <p className="cwh-note">
              The photos above show a decanter bowl before rebuild and a decanter bowl after rebuild, as labeled in our
              archive.
            </p>
          </div>
        </section>

        {/* S5 the one CTA band */}
        <section className="cwh-blk" aria-labelledby="cwh-ready">
          <div className="cwh-wrap">
            <div className="cwh-band">
              <div>
                <h2 id="cwh-ready">Have This Ready When You Call</h2>
                <ul className="cwh-band-list">
                  {READY.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="cwh-band-cta">
                <p className="cwh-label cwh-tf">Call toll-free</p>
                <CallButton id="cwh-bandcall" />
                <p className="cwh-sec-wrap">
                  <Link className="cwh-sec" href={FORM_HREF}>
                    Send Us the Details
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* S6 locations, email footer style. NAP from data/nap.json only. */}
        <section className="cwh-blk cwh-tint" aria-labelledby="cwh-loc">
          <div className="cwh-wrap">
            <h2 id="cwh-loc">Locations</h2>
            <p className="cwh-hours">{HOURS_LINE}</p>
            <div className="cwh-locs">
              <div className="cwh-loc">
                <figure className="cwh-map">
                  <Image src={mapHouston} alt="Map of the Houston area" sizes="(min-width: 768px) 560px, calc(100vw - 32px)" />
                  <figcaption>{MAP_CAPTION}</figcaption>
                </figure>
                <div className="cwh-loc-body">
                  <h3>Houston Location</h3>
                  <p>
                    <TelLink role={PRIMARY_PHONE_ROLE} className="cwh-tel">
                      T <span className="cwh-num">{primaryDisplay}</span>
                    </TelLink>
                  </p>
                  <p>{addressLine(houston)}</p>
                  {SHOW_LOCAL_NUMBERS ? (
                    <p className="cwh-local">
                      <TelLink role="houston" className="cwh-tel cwh-tel-quiet">
                        {phones.houston.role}: <span className="cwh-num">{phones.houston.display}</span>
                      </TelLink>
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="cwh-loc">
                <figure className="cwh-map">
                  <Image src={mapChicago} alt="Map of the Chicago area" sizes="(min-width: 768px) 560px, calc(100vw - 32px)" />
                  <figcaption>{MAP_CAPTION}</figcaption>
                </figure>
                <div className="cwh-loc-body">
                  <h3>Chicago Location</h3>
                  <p>
                    <TelLink role="chicago" className="cwh-tel">
                      T <span className="cwh-num">{chicagoDisplay}</span>
                    </TelLink>
                  </p>
                  <p>{addressLine(franklin)}</p>
                  {SHOW_LOCAL_NUMBERS ? (
                    <p className="cwh-local">
                      <TelLink role="chicago" sms className="cwh-tel cwh-tel-quiet">
                        Text Us
                      </TelLink>
                    </p>
                  ) : null}
                  {SHOW_ALSIP ? (
                    <div className="cwh-loc-extra">
                      <h3>{alsip.label}</h3>
                      <p>
                        <TelLink role={alsip.phone} className="cwh-tel">
                          T <span className="cwh-num">{primaryDisplay}</span>
                        </TelLink>
                      </p>
                      <p>{addressLine(alsip)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {SHOW_LOCAL_NUMBERS ? (
              <p className="cwh-local cwh-emerg">
                <TelLink role="emergency" className="cwh-tel cwh-tel-quiet">
                  {phones.emergency.role}: <span className="cwh-num">{phones.emergency.display}</span>
                </TelLink>
              </p>
            ) : null}
          </div>
        </section>

        {/* Short FAQ near the bottom (live-site copy, word for word). Open text, no accordion. */}
        {SHOW_FAQ ? (
          <section className="cwh-blk" aria-labelledby="cwh-faq">
            <div className="cwh-wrap">
              <h2 id="cwh-faq">Frequently asked questions</h2>
              <dl className="cwh-faq">
                {HOME_FAQ_KEYS.slice(0, 3).map((k) => (
                  <div key={k}>
                    <dt>{HOME_FAQ_BANK[k].question}</dt>
                    <dd>{HOME_FAQ_BANK[k].answer}</dd>
                  </div>
                ))}
              </dl>
              <p className="cwh-more">
                <Link href="/resources/faqs/">All FAQs</Link>
              </p>
            </div>
          </section>
        ) : null}
      </main>

      {/* S7 footer on tint (full-color logo needs a light ground). */}
      <footer className="cwh-footer">
        <div className="cwh-wrap cwh-fgrid">
          <div className="cwh-fbrand">
            <Image src={logo} alt="Centrifuge World" width={150} height={48} sizes="150px" />
            <TelLink role={PRIMARY_PHONE_ROLE} className="cwh-btn cwh-btn-call">
              <span className="cwh-num">{primaryDisplay}</span>
            </TelLink>
            <p className="cwh-fhours">{HOURS_LINE}</p>
          </div>
          <div>
            <p className="cwh-label">Services</p>
            <ul>
              <li><Link href="/services/centrifuge-repair/">Centrifuge Repair</Link></li>
              <li><Link href="/services/centrifuge-rebuilds/">Centrifuge Rebuilds</Link></li>
              <li><Link href="/services/decanter-centrifuge-repair/">Decanter Centrifuge Repair</Link></li>
              <li><Link href="/services/">View All Services</Link></li>
            </ul>
          </div>
          <div>
            <p className="cwh-label">Brands</p>
            <ul>
              <li><Link href="/brands/alfa-laval/">Alfa Laval</Link></li>
              <li><Link href="/brands/sharples/">Sharples</Link></li>
              <li><Link href="/brands/westfalia/">GEA Westfalia</Link></li>
              <li><Link href="/brands/">All Brands</Link></li>
            </ul>
          </div>
          <div>
            <p className="cwh-label">Industries</p>
            <ul>
              <li><Link href="/industries/rendering/">Rendering</Link></li>
              <li><Link href="/industries/wastewater-treatment/">Wastewater Treatment</Link></li>
              <li><Link href="/industries/">All Industries</Link></li>
            </ul>
          </div>
          <div>
            <p className="cwh-label">Company</p>
            <ul>
              <li><Link href="/about/">About</Link></li>
              <li><Link href="/locations/">Locations</Link></li>
              <li><Link href="/used-centrifuges/">Buy Used Centrifuges</Link></li>
              <li><Link href="/resources/faqs/">FAQs</Link></li>
              <li><Link href="/contact-cw/">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="cwh-wrap cwh-legal">
          <p>Copyright © 2026 Centrifuge World, All rights reserved.</p>
          <p>
            <Link href="/privacy-policy/">Privacy Policy</Link>
            <Link href="/terms-of-use/">Terms of Use</Link>
          </p>
        </div>
      </footer>

      <StickyCallBar watchIds={['cwh-herocall', 'cwh-bandcall']} />
    </div>
  )
}
