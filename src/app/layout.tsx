import type { Metadata } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
import { fontVariables } from '@/lib/fonts'
import { metadataBase } from '@/lib/seo'
import { GTM_ID, org } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { MotionRoot } from '@/components/MotionRoot'
import { siteWideSchemas } from '@/lib/schema'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${org.name} — Industrial Centrifuge Repair, Rebuilds & 24/7 Emergency Service`,
    template: `%s | ${org.name}`,
  },
  description: org.description,
  applicationName: org.name,
  formatDetection: { telephone: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <JsonLd data={siteWideSchemas()} />
        {children}
        <MotionRoot />
        {/* GTM loaded after-interactive by @next/third-parties (Definition of Done). */}
        {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      </body>
    </html>
  )
}
