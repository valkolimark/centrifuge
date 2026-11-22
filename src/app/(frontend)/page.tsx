import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { HomePage } from '@/components/home-redesign/HomePage'
import { webPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, mainPhone, org } from '@/lib/site'

// Home page redesign (preview branch home-redesign-preview). Email-style system per
// Creative's direction (/workspace/centrifuge-site-redesign/home-direction.md).
// Owner switches live in src/components/home-redesign/config.ts.
// The previous home page is in git history on main (f7596b9); no other page changed.

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  {
    // Live title, unchanged (no dashes).
    title: 'Industrial Centrifuge Repair & Rebuilds | Centrifuge World',
    // Approved CW23 email/landing lede + approved CTA wording. Dash free.
    description: `Centrifuge World balances, repairs and rebuilds centrifuges. Call 1 ${mainPhone.display}.`,
  },
  '/',
)

export default function Page() {
  return (
    <>
      <JsonLd data={[webPageSchema({ url: `${SITE_URL}/`, name: `${org.name} Home` })]} />
      <HomePage />
    </>
  )
}
