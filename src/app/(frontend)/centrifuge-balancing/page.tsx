import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { EmailLandingPage } from '@/components/email-landing/EmailLandingPage'
import { emailLandingPages } from '@/components/email-landing/content'

// Email landing page for the 2026-11-23 send.
const page = emailLandingPages['centrifuge-balancing']
export const metadata: Metadata = {
  ...buildMetadata({ title: `${page.title} | Centrifuge World`, description: page.lede }, '/centrifuge-balancing/'),
  robots: { index: false, follow: true }, // email-only page; confirm with Mark/Analyst before indexing
}
export default function Page() {
  return <EmailLandingPage page={page} />
}
