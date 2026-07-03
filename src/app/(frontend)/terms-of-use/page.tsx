import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LegalDoc, type LegalSection } from '@/components/blocks/LegalDoc'
import { buildMetadata } from '@/lib/seo'
import { org } from '@/lib/site'

// TODO(verify: legal review by client counsel) — publishable draft, not legal advice.
export const metadata: Metadata = buildMetadata(
  { title: 'Terms of Use | Centrifuge World', description: 'The terms governing your use of the Centrifuge World website.' },
  '/terms-of-use/',
)

const UPDATED = 'July 2, 2026'

const sections: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    body: (
      <p>
        These Terms of Use govern your access to and use of {org.url} operated by {org.name}. By using
        the site, you agree to these terms. If you do not agree, please do not use the site.
      </p>
    ),
  },
  {
    heading: 'Use of the site',
    body: (
      <ul className="space-y-1">
        <li>You may use the site for lawful purposes related to our products and services.</li>
        <li>You agree not to misuse the site, interfere with its operation, or attempt unauthorized access.</li>
        <li>You are responsible for the accuracy of information you submit through our forms.</li>
      </ul>
    ),
  },
  {
    heading: 'Intellectual property',
    body: (
      <p>
        The site content, including text, graphics, logos, and images, is owned by or licensed to{' '}
        {org.name} and is protected by applicable intellectual-property laws. Brand names and marks
        referenced on the site are the property of their respective owners; we service equipment from
        those manufacturers as an independent specialist and are not affiliated with them.
      </p>
    ),
  },
  {
    heading: 'No warranty on information',
    body: (
      <p>
        Site content is provided for general information and does not constitute a binding quote,
        warranty, or professional advice. Service scope, pricing, and turnaround are confirmed only in
        a written quote following inspection.
      </p>
    ),
  },
  {
    heading: 'Third-party links & embeds',
    body: (
      <p>
        The site may link to or embed third-party services (for example, our inventory subdomain and
        embedded forms). We are not responsible for the content or practices of third-party services,
        which are governed by their own terms.
      </p>
    ),
  },
  {
    heading: 'Limitation of liability',
    body: (
      <p>
        To the fullest extent permitted by law, {org.name} is not liable for any indirect, incidental,
        or consequential damages arising from your use of the site. TODO(verify: liability and
        governing-law language with counsel).
      </p>
    ),
  },
  {
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. Continued use of the site after changes take
        effect constitutes acceptance of the revised terms.
      </p>
    ),
  },
  {
    heading: 'Contact',
    body: (
      <p>
        Questions about these terms? Reach us through our <a href="/contact-cw/">contact page</a>.
      </p>
    ),
  },
]

export default function TermsOfUsePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Terms of Use', url: '/terms-of-use/' }]} />
      <Section>
        <LegalDoc title="Terms of Use" updated={UPDATED} sections={sections} />
      </Section>
    </SiteShell>
  )
}
