import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { emergencyPhone } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <SiteShell>
      <Section>
        <div className="mx-auto max-w-xl py-10 text-center">
          <p className="font-heading text-5xl font-bold text-blue">404</p>
          <h1 className="mt-3">We couldn&apos;t find that page</h1>
          <p className="mt-2 text-steel-700">
            The page may have moved. Try the homepage, or call us if your centrifuge needs service.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href={`tel:${emergencyPhone.number}`} variant="emergency">
              24/7 Emergency: {emergencyPhone.display}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </SiteShell>
  )
}
