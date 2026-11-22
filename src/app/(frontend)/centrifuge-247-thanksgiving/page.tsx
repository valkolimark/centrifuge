import type { Metadata } from 'next'
import { EmailLandingPage } from '@/components/email-landing/EmailLandingPage'
import { emailLandingPages } from '@/components/email-landing/content'

// Email landing page for the 2026-11-25 send.
const page = emailLandingPages['centrifuge-247-thanksgiving']
export const metadata: Metadata = {
  title: { absolute: `${page.title} | Centrifuge World` },
  description: page.lede,
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://centrifuge.com/centrifuge-247-thanksgiving/' },
}
export default function Page() {
  return <EmailLandingPage page={page} />
}
