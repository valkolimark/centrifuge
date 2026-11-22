import type { Metadata } from 'next'
import { EmailLandingPage } from '@/components/email-landing/EmailLandingPage'
import { emailLandingPages } from '@/components/email-landing/content'

// Email landing page for the 2026-11-30 send.
const page = emailLandingPages['decanter-bowl-rebuild-before-after']
export const metadata: Metadata = {
  title: { absolute: `${page.title} | Centrifuge World` },
  description: page.lede,
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://centrifuge.com/decanter-bowl-rebuild-before-after/' },
}
export default function Page() {
  return <EmailLandingPage page={page} />
}
