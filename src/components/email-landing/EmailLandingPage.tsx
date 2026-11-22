import { preload } from 'react-dom'
import { SiteShell } from '@/components/layout/SiteShell'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { TrackedButtonLink } from '@/components/ui/TrackedButtonLink'
import { LeadForm } from '@/components/forms/LeadForm'
import { phone } from '@/lib/site'
import { LiquidHero } from './LiquidHero'
import { Reveal } from './Reveal'
import { StickyCallBar } from './StickyCallBar'
import { LandingPicture } from './LandingPicture'
import type { EmailLandingContent } from './content'
import { emailLandingForm } from '@/lib/forms/config'
import { emailLandingFont } from './font'
import './email-landing.css'

const MAIN = 'main' // nap.json phones.main = +1-800-208-6075
const CHICAGO = 'chicago' // nap.json phones.chicago = +1-773-617-0937

function rich(text: string) {
  const m = text.match(/^\*\*(.+?)\*\*\s*(.*)$/)
  return m ? (<><strong>{m[1]}</strong> {m[2]}</>) : text
}

function CallLabel({ label }: { label: string }) {
  const [lab, num] = label.split(/:\s+/)
  return (<><span className="whitespace-nowrap">{'\u260E\u00A0'}{lab}:</span> <span className="whitespace-nowrap">{num}</span></>)
}

export function EmailLandingPage({ page }: { page: EmailLandingContent }) {
  const main = phone(MAIN as never)
  const preloadPhoto = page.heroPhotos.find((p) => p.priority)
  if (preloadPhoto) {
    const href = preloadPhoto.webpSrcSet.split(',')[1]?.trim().split(' ')[0] || preloadPhoto.src.replace(/\.jpg$/, '.webp')
    preload(href, {
      as: 'image',
      imageSrcSet: preloadPhoto.webpSrcSet,
      imageSizes: preloadPhoto.sizes,
      fetchPriority: 'high',
    })
  }

  return (
    <SiteShell>
      <div className={`el-root ${emailLandingFont.variable}`}>
        <LiquidHero
          slug={page.slug}
          title={page.title}
          lede={page.lede}
          photos={page.heroPhotos}
          actions={
            <>
              <PhoneLink role={MAIN} className="el-btn el-btn-call" >
                <CallLabel label={page.heroCall} />
              </PhoneLink>
              <TrackedButtonLink href="#form" variant="secondary" className="el-btn el-btn-form" ctaLabel={page.formButton} ctaLocation="lp-hero-button">
                {page.formButton}
              </TrackedButtonLink>
            </>
          }
        />

        <section className="el-section">
          <div className="el-detail">
            <div>
              {page.sections.map((s) => (
                <Reveal key={s.h2} className="el-block">
                  <h2>{s.h2}</h2>
                  {s.paras.map((p) => <p key={p}>{p}</p>)}
                  {s.items.length > 0 && (
                    <ul className="el-checks">{s.items.map((i) => <li key={i}><span>{rich(i)}</span></li>)}</ul>
                  )}
                </Reveal>
              ))}
              {page.tiles.length > 0 && (
                <figure className="el-tiles left">
                  <div className="row" role="group" aria-label={page.tiles[0]?.alt || 'Shop photos'}>
                    {page.tiles.map((t) => (
                      <LandingPicture key={t.src} photo={t} />
                    ))}
                  </div>
                </figure>
              )}
              <p className="el-body-call"><PhoneLink role={MAIN} className="el-btn el-btn-call"><CallLabel label={page.bodyCall} /></PhoneLink></p>
            </div>
            <div className="el-aside">
              <div id="form" className="el-form">
                <h3>{page.form.heading}</h3>
                <LeadForm type="contact" compact config={emailLandingForm(page.form.heading, page.form.button)} />
                <p className="el-under">{page.form.under}</p>
              </div>
              {page.gallery.length > 0 && (
                <div className="el-gallery">
                  {page.gallery.map((p) => (
                    <Reveal as="figure" key={p.src}>
                      <LandingPicture photo={p} className="el-gimg" />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="el-band">
          <div className="el-band-wrap">
            <h2>{page.bandText}</h2>
            <div className="el-ctas">
              <PhoneLink role={MAIN} className="el-btn el-btn-call"><CallLabel label={page.heroCall} /></PhoneLink>
              <TrackedButtonLink href="#form" variant="outline-dark" className="el-btn el-btn-form el-btn-form-on-dark" ctaLabel={page.formButton} ctaLocation="lp-band-button">{page.formButton}</TrackedButtonLink>
            </div>
          </div>
        </section>

        <section className="el-section">
          <div className="el-locs">
            <div className="el-loc">
              <img src="/images/email-landing/shared/lp-map-houston.webp" width="800" height="564" alt="Map of the Houston area" loading="lazy" decoding="async" />
              <div>
                <h3>Houston Location</h3>
                <p>
                  <PhoneLink role={MAIN} className="el-loc-phone">
                    T <span className="whitespace-nowrap">1 (800) 208-6075</span>
                  </PhoneLink>
                </p>
                <p>7650 CR 48 unit C, Rosharon, TX 77583</p>
              </div>
            </div>
            <div className="el-loc">
              <img src="/images/email-landing/shared/lp-map-chicago.webp" width="800" height="564" alt="Map of the Chicago area" loading="lazy" decoding="async" />
              <div>
                <h3>Chicago Location</h3>
                <p>
                  <PhoneLink role={CHICAGO} className="el-loc-phone">
                    T <span className="whitespace-nowrap">+ 1-773-617-0937</span>
                  </PhoneLink>
                </p>
                <p>9212 Cherry Ave, Franklin Park, IL 60131</p>
              </div>
            </div>
          </div>
        </section>

        <StickyCallBar role={MAIN} number={main.number} label={page.sticky} />
      </div>
    </SiteShell>
  )
}
