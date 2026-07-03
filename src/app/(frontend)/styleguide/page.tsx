import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { TrustBar } from '@/components/blocks/TrustBar'
import { ServiceGrid } from '@/components/blocks/ServiceCard'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { ProcessSteps } from '@/components/blocks/ProcessSteps'
import { StatsRow } from '@/components/blocks/StatsRow'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { BeforeAfterSlider } from '@/components/blocks/BeforeAfterSlider'
import { Gallery } from '@/components/blocks/Gallery'
import { LogoRow } from '@/components/blocks/LogoRow'
import { LocationCard } from '@/components/blocks/LocationCard'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { FormDemo } from './FormDemo'
import { locations, emergencyPhone } from '@/lib/site'
import { photos } from '@/lib/media'
import { palette } from '../../../../scripts/contrast-pairs'

// /styleguide — the component library reference. Noindexed (robots + metadata).
// Every component and variant renders here; it is a CI Lighthouse target.
export const metadata: Metadata = {
  title: 'Style Guide',
  robots: { index: false, follow: false },
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-card border border-steel-300 bg-white p-2 text-xs">
      <div className="mb-2 h-12 rounded" style={{ background: value }} />
      <p className="font-semibold text-navy">{name}</p>
      <p className="text-steel-500">{value}</p>
    </div>
  )
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 border-b border-steel-300 pb-2">{title}</h2>
      {children}
    </section>
  )
}

export default function StyleGuidePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Style Guide', url: '/styleguide/' }]} />

      <Section className="!pt-4">
        <h1>Web Blue — Style Guide</h1>
        <p className="mt-2 max-w-2xl text-steel-700">
          The Cycle 1 component library and design tokens. Noindexed. Every component variant is
          rendered here and scanned by axe-core + Lighthouse in CI.
        </p>

        <div className="mt-10 space-y-14">
          <Block id="color" title="Color tokens">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {Object.entries(palette).map(([name, value]) => (
                <Swatch key={name} name={name} value={value} />
              ))}
            </div>
          </Block>

          <Block id="type" title="Typography (Archivo headings · Inter body)">
            <div className="space-y-2">
              <h1>Heading 1 — Archivo 800</h1>
              <h2>Heading 2 — Archivo 700</h2>
              <h3>Heading 3 — Archivo 700</h3>
              <h4>Heading 4</h4>
              <p className="max-w-2xl">
                Body text in Inter. Plain, technical, confident — written for plant managers,
                maintenance managers, and procurement engineers. <a href="#type">This is a link</a>.
              </p>
              <p className="text-sm text-steel-500">Muted / small — steel-500</p>
            </div>
          </Block>

          <Block id="buttons" title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="emergency">Emergency</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="lg">Large primary</Button>
              <ButtonLink href="/request-a-quote/">Link button</ButtonLink>
            </div>
          </Block>

          <Block id="phone" title="PhoneLink (tracks phone_click)">
            <p>
              Emergency: <PhoneLink role="emergency" className="text-link" showRole />
            </p>
          </Block>

          <Block id="hero" title="Hero — variants">
            <div className="space-y-6">
              <Hero
                variant="home"
                eyebrow="Home variant"
                title="Keep your centrifuges running."
                subtitle="Dark hero with dual CTA and background image."
                image={{ ...photos.shopHero, priority: true }}
                actions={
                  <>
                    <ButtonLink href={`tel:${emergencyPhone.number}`} variant="emergency">
                      24/7 Emergency
                    </ButtonLink>
                    <ButtonLink href="/request-a-quote/" variant="on-dark">
                      Request a Quote
                    </ButtonLink>
                  </>
                }
              />
              <Hero variant="interior" eyebrow="Interior variant" title="Decanter Centrifuge Repair" subtitle="Light interior hero for content pages." />
              <Hero variant="emergency" eyebrow="Emergency variant" title="24/7 Emergency Centrifuge Service" subtitle="Emergency red — reserved for the 24/7 line & emergencies." />
            </div>
          </Block>

          <Block id="answerbox" title="AnswerBox">
            <AnswerBox question="Who repairs industrial centrifuges?">
              Centrifuge World has repaired and rebuilt industrial centrifuges since 1939. From three
              US facilities we service 45+ OEM brands with shop repair, field service, balancing,
              parts fabrication, and a 24/7 emergency line.
            </AnswerBox>
          </Block>

          <Block id="trustbar" title="TrustBar"><TrustBar /></Block>

          <Block id="services" title="ServiceCard grid">
            <ServiceGrid
              items={[
                { title: 'Centrifuge Repair', href: '/services/centrifuge-repair/', description: 'Diagnostics, teardown, and precision repair.' },
                { title: 'Rebuilds', href: '/services/centrifuge-rebuilds/', description: 'Restore OEM performance affordably.' },
                { title: 'Balancing & Testing', href: '/services/balancing-testing/', description: 'Dynamic hard-bearing balancing.' },
              ]}
            />
          </Block>

          <Block id="emergency" title="EmergencyCallout"><EmergencyCallout /></Block>

          <Block id="process" title="ProcessSteps">
            <ProcessSteps steps={[{ title: 'Inspect' }, { title: 'Quote' }, { title: 'Rebuild' }, { title: 'Balance' }, { title: 'Test' }, { title: 'Return' }]} />
          </Block>

          <Block id="stats" title="StatsRow">
            <StatsRow stats={[{ value: '1939', label: 'Founded' }, { value: '3', label: 'US facilities' }, { value: '45+', label: 'OEM brands' }, { value: '24/7', label: 'Emergency' }]} />
          </Block>

          <Block id="faq" title="FAQAccordion (emits FAQPage schema)">
            <FAQAccordion
              emitSchema={false}
              items={[
                { question: 'Do you offer emergency centrifuge repair?', answer: 'Yes — 24/7 on-call, with field techs and expedited shop turnaround.' },
                { question: 'Can you inspect a centrifuge before quoting?', answer: 'Yes — our process is inspection-first.' },
              ]}
            />
          </Block>

          <Block id="beforeafter" title="BeforeAfterSlider (pointer + keyboard)">
            <BeforeAfterSlider before={photos.before} after={photos.after} />
          </Block>

          <Block id="gallery" title="Gallery">
            <Gallery images={photos.gallery} />
          </Block>

          <Block id="logos" title="LogoRow (text lockups — no fabricated logos)"><LogoRow /></Block>

          <Block id="locations" title="LocationCard">
            <div className="grid gap-4 md:grid-cols-3">
              {locations.map((loc) => (
                <LocationCard key={loc.id} loc={loc} />
              ))}
            </div>
          </Block>

          <Block id="related" title="RelatedLinks">
            <RelatedLinks
              groups={[
                { heading: 'Services', links: [{ label: 'Decanter Repair', href: '/services/decanter-centrifuge-repair/' }, { label: 'Rebuilds', href: '/services/centrifuge-rebuilds/' }] },
                { heading: 'Brands', links: [{ label: 'Sharples', href: '/brands/sharples/' }, { label: 'Alfa Laval', href: '/brands/alfa-laval/' }] },
                { heading: 'Industries', links: [{ label: 'Wastewater', href: '/industries/wastewater-treatment/' }] },
              ]}
            />
          </Block>

          <Block id="forms" title="Form primitives (Turnstile + honeypot)">
            <FormDemo />
          </Block>

          <Block id="cta" title="CTABanner"><CTABanner /></Block>
        </div>
      </Section>
    </SiteShell>
  )
}
