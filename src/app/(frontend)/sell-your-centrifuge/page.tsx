import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { CTABanner } from '@/components/blocks/CTABanner'
import { buildMetadata } from '@/lib/seo'

// Sell Your Centrifuge (legacy -2 slug already redirects here). Uses the native
// Sell form (condition + asking price, photo-forward).
export const metadata: Metadata = buildMetadata(
  { title: 'Sell Your Centrifuge | Centrifuge World', description: 'Sell your used industrial centrifuge to Centrifuge World. Send machine details and photos for review.' },
  '/sell-your-centrifuge/',
)

export default function SellPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Sell Your Centrifuge', url: '/sell-your-centrifuge/' }]} />
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1>Sell your centrifuge</h1>
          <div className="mt-5">
            <AnswerBox question="Do you buy used centrifuges?">
              Yes — Centrifuge World buys used industrial centrifuges. Send us your machine type,
              brand, model, condition, and photos, and our team will review and follow up. To buy a
              rebuilt or used machine instead, browse our inventory.
            </AnswerBox>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-card border border-steel-300 bg-white p-4">
              <p className="font-semibold text-navy">1. Send details</p>
              <p className="mt-1 text-sm text-steel-700">Machine type, brand, model, condition.</p>
            </div>
            <div className="rounded-card border border-steel-300 bg-white p-4">
              <p className="font-semibold text-navy">2. Add photos</p>
              <p className="mt-1 text-sm text-steel-700">Photos help us assess quickly.</p>
            </div>
            <div className="rounded-card border border-steel-300 bg-white p-4">
              <p className="font-semibold text-navy">3. We follow up</p>
              <p className="mt-1 text-sm text-steel-700">Our team reviews and responds.</p>
            </div>
          </div>
          <div className="mt-8">
            <QuoteForm />
          </div>
        </div>
      </Section>
      <CTABanner primary={{ label: 'Buy a centrifuge', href: 'https://inventory.centrifuge.com' }} secondary={{ label: 'Contact us', href: '/contact-cw/' }} />
    </SiteShell>
  )
}
