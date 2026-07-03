import { ButtonLink } from '@/components/ui/Button'

// CTABanner: closing call-to-action used at the foot of content pages.
export function CTABanner({
  heading = 'Ready to get your centrifuge back in service?',
  body = 'Send us your machine details for an inspection-first quote. No obligation.',
  primary = { label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' },
  secondary,
}: {
  heading?: string
  body?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="bg-navy text-white">
      <div className="container-cw flex flex-col items-start gap-5 py-[var(--space-8)] md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-white">{heading}</h2>
          <p className="mt-2 text-white/90">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={primary.href} variant="on-dark">
            {primary.label}
          </ButtonLink>
          {secondary ? (
            <ButtonLink href={secondary.href} variant="outline-dark">
              {secondary.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  )
}
