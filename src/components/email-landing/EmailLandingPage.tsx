import Image from 'next/image'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { TrackedButtonLink } from '@/components/ui/TrackedButtonLink'
import { LeadForm } from '@/components/forms/LeadForm'
import { phone } from '@/lib/site'
import { LiquidHero } from './LiquidHero'
import { Reveal } from './Reveal'
import { StickyCallBar } from './StickyCallBar'
import type { EmailLandingContent } from './content'
import { emailLandingForm } from '@/lib/forms/config'
import { emailLandingFont } from './font'
import './email-landing.css'

// DRAFT server component for the three Centrifuge World email landing pages (Nov 23, 25, 30, 2026).
// Mirrors the staged static pages in /workspace/email-campaigns/nov-23-30-2026/cw/<date>/landing.html.
// Phone numbers come from nap.json via PhoneLink role keys (never hand-typed): role "main" is assumed to be
// 1 (800) 208-6075 (verified in data/nap.json Nov 19, 2026). Analytics: PhoneLink fires phone_click, TrackedButtonLink cta_click,
// LeadForm fires form_submit on server-confirmed success. cta_location values match Analyst's lp-* positions.

const MAIN = 'main' // nap.json phones.main = +1-800-208-6075 (verified)

function rich(text: string) {
  // **Role:** bold lead-ins from the approved copy
  const m = text.match(/^\*\*(.+?)\*\*\s*(.*)$/)
  return m ? (<><strong>{m[1]}</strong> {m[2]}</>) : text
}

function CallLabel({ label }: { label: string }) {
  const [lab, num] = label.split(/:\s+/)
  return (<><span className="whitespace-nowrap">{lab}:</span> <span className="whitespace-nowrap">{num}</span></>)
}

export function EmailLandingPage({ page }: { page: EmailLandingContent }) {
  const main = phone(MAIN as never)
  return (
    <SiteShell>
      <div className={`el-root ${emailLandingFont.variable}`}>
      <LiquidHero
        title={page.title}
        lede={page.lede}
        photos={page.beforeAfter ? page.photos.slice(1, 2) : page.photos.slice(0, 1)} /* fix round 1: one drop (AFTER); the pair shows once, below */
        actions={
          <>
            <PhoneLink role={MAIN} className="el-btn el-btn-call" >
              <CallLabel label={page.heroCall} />
            </PhoneLink>
            <TrackedButtonLink href="#form" variant="secondary" ctaLabel={page.formButton} ctaLocation="lp-hero-button">
              {page.formButton}
            </TrackedButtonLink>
          </>
        }
      />

      {page.beforeAfter && (
        <Section>
          <h2>Before and After</h2>
          <div className="mt-6 grid gap-7 sm:grid-cols-2">
            {page.photos.slice(0, 2).map((p) => (
              <Reveal as="figure" key={p.src}>
                <Image src={p.src} alt={p.alt} width={p.width} height={p.height} className="h-auto w-full rounded-[32px] object-cover" sizes="(max-width:640px) 92vw, 560px" />
                <figcaption className="mt-3 text-sm font-extrabold tracking-wide text-navy">{p.caption}</figcaption>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="grid items-start gap-14 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            {page.sections.filter((s) => s.h2 !== 'Before and After').map((s) => (
              <Reveal key={s.h2} className="mt-10 first:mt-0">
                <h2 className="text-balance">{s.h2}</h2>
                {s.paras.map((p) => <p key={p} className="mt-3 text-lg">{p}</p>)}
                {s.items.length > 0 && (
                  <ul className="el-checks mt-5">{s.items.map((i) => <li key={i}>{rich(i)}</li>)}</ul>
                )}
              </Reveal>
            ))}
            <p className="mt-7"><PhoneLink role={MAIN} className="el-btn el-btn-call"><CallLabel label={page.bodyCall} /></PhoneLink></p>
          </div>
          <div id="form" className="lg:sticky lg:top-24">
            {/* Approved fields (Name*, Company*, Work email*, Phone*, Machine make and type, What is it doing?*) as a
                presentation of the existing 'contact' form type: same server action, Turnstile, honeypot, leads pipeline
                and form_submit event, no new DB enum value. */}
            <h2 className="mb-5">{page.form.heading}</h2>
            <LeadForm type="contact" config={emailLandingForm(page.form.heading, page.form.button)} />
            <p className="mt-3 text-sm text-steel-700">{page.form.under}</p>
          </div>
        </div>
      </Section>

      {page.photos.length > (page.beforeAfter ? 2 : 1) && (
        <Section>
          <div className="mx-auto grid max-w-md">
            {page.photos.slice(page.beforeAfter ? 2 : 1).map((p) => (
              <Reveal as="figure" key={p.src}>
                <Image src={p.src} alt={p.alt} width={p.width} height={p.height} className="el-mask h-auto w-full" sizes="(max-width:640px) 82vw, 440px" />
                <figcaption className="mt-3 text-sm font-extrabold tracking-wide text-navy">{p.caption}</figcaption>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <section className="el-band mx-3 rounded-[28px] bg-navy py-12 text-white sm:mx-6 sm:rounded-[40px] sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-7 px-6">
          <h2 className="m-0 max-w-[16em] text-white">{page.bandText}</h2>
          <div className="flex flex-wrap gap-3">
            <PhoneLink role={MAIN} className="el-btn el-btn-call"><CallLabel label={page.heroCall} /></PhoneLink>
            <TrackedButtonLink href="#form" variant="on-dark" ctaLabel={page.formButton} ctaLocation="lp-band-button">{page.formButton}</TrackedButtonLink>
          </div>
        </div>
      </section>
      {/* Locations: reuse the site's existing locations block (nap.json). Footer stays the site footer. */}
      <StickyCallBar role={MAIN} number={main.number} label={page.sticky} />
      </div>
    </SiteShell>
  )
}
