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
      <head>
        {/* S3 hosts the hero (LCP) image on nearly every page — preconnect it.
            Form/video hosts are page-specific, so use lighter dns-prefetch to avoid
            "unused preconnect" on pages that don't request them. */}
        <link rel="preconnect" href="https://centrifuge-im.s3.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.cognitoforms.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
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
