import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LegalDoc, type LegalSection } from '@/components/blocks/LegalDoc'
import { buildMetadata } from '@/lib/seo'
import { org, mainPhone } from '@/lib/site'

// TODO(verify: legal review by client counsel) — publishable draft, not legal advice.
export const metadata: Metadata = buildMetadata(
  { title: 'Privacy Policy | Centrifuge World', description: 'How Centrifuge World collects, uses, and protects information submitted through our website and forms.' },
  '/privacy-policy/',
)

const UPDATED = 'July 2, 2026'

const sections: LegalSection[] = [
  {
    heading: 'Overview',
    body: (
      <p>
        This Privacy Policy explains how {org.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects,
        uses, and shares information when you visit {org.url} or submit a form. By using the site you
        agree to the practices described here.
      </p>
    ),
  },
  {
    heading: 'Information we collect',
    body: (
      <ul className="space-y-1">
        <li>Information you submit through our forms — such as name, company, email, phone, location, equipment details, message, and any photos you upload.</li>
        <li>Technical information collected automatically — such as IP address, browser type, pages viewed, and referring URLs.</li>
        <li>Cookies and similar technologies used for analytics and site functionality (see &ldquo;Cookies &amp; analytics&rdquo;).</li>
      </ul>
    ),
  },
  {
    heading: 'How we use information',
    body: (
      <ul className="space-y-1">
        <li>To respond to quote, service, and contact requests and to provide our services.</li>
        <li>To operate, maintain, and improve the website.</li>
        <li>To communicate with you about your inquiries and, where permitted, our services.</li>
        <li>To detect and prevent spam, fraud, and abuse.</li>
      </ul>
    ),
  },
  {
    heading: 'Cookies & analytics',
    body: (
      <p>
        We use Google Tag Manager and Google Analytics 4 to understand how the site is used. These
        tools may set cookies and collect usage data. Some pages may include ad or tracking pixels.
        You can control cookies through your browser settings. TODO(verify: confirm active ad/tracking
        pixels and consent requirements with client).
      </p>
    ),
  },
  {
    heading: 'Forms & anti-spam',
    body: (
      <p>
        Our forms use Cloudflare Turnstile and, in some cases, embedded Cognito Forms to reduce spam.
        Submissions are transmitted to us by email and stored in our content system. Data submitted
        through embedded third-party forms is also processed by that provider under its own policy.
      </p>
    ),
  },
  {
    heading: 'How we share information',
    body: (
      <p>
        We do not sell your personal information. We share it only with service providers who help us
        operate the site and respond to you, and as required by law. Our processors include Vercel
        (hosting), Neon (database), Resend (email delivery), Cloudflare (anti-spam), Cognito Forms
        (embedded forms), and Google (analytics/tag management).
      </p>
    ),
  },
  {
    heading: 'Data storage & retention',
    body: (
      <p>
        Submissions are stored in a database hosted with Neon and application infrastructure hosted
        with Vercel. We retain form submissions for as long as needed to respond to and service your
        request and to meet our legal and business obligations.
      </p>
    ),
  },
  {
    heading: 'Your choices & rights',
    body: (
      <p>
        You may request access to, correction of, or deletion of the personal information you have
        submitted, subject to applicable law. To make a request, contact us using the details below.
        TODO(verify: state-specific privacy rights disclosures with counsel).
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <p>
        Questions about this policy? Call {mainPhone.display} or reach us through our{' '}
        <a href="/contact-cw/">contact page</a>. Public email contact: TODO(verify: confirm
        public-facing email).
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Privacy Policy', url: '/privacy-policy/' }]} />
      <Section>
        <LegalDoc title="Privacy Policy" updated={UPDATED} sections={sections} />
      </Section>
    </SiteShell>
  )
}
