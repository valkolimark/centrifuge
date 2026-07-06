import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { Services } from './payload/collections/Services'
import { OEMBrands } from './payload/collections/OEMBrands'
import { Industries } from './payload/collections/Industries'
import { Locations } from './payload/collections/Locations'
import { Posts } from './payload/collections/Posts'
import { CaseStudies } from './payload/collections/CaseStudies'
import { HowItWorks } from './payload/collections/HowItWorks'
import { Inventory } from './payload/collections/Inventory'
import { CompetitorSnapshots } from './payload/collections/CompetitorSnapshots'
import { FAQs } from './payload/collections/FAQs'
import { FormSubmissions } from './payload/collections/FormSubmissions'
import { Leads } from './payload/collections/Leads'
import { Quotes } from './payload/collections/Quotes'
import { Redirects } from './payload/collections/Redirects'
import { SiteSettings } from './payload/globals/SiteSettings'
import { HeaderNav } from './payload/globals/HeaderNav'
import { FooterNav } from './payload/globals/FooterNav'
import { LeadRouting } from './payload/globals/LeadRouting'
import { QuoteDefaults } from './payload/globals/QuoteDefaults'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// RUNTIME must use the POOLED Neon endpoint (…-pooler, PgBouncer). The non-pooled/direct
// endpoint has a small connection limit and serverless concurrency exhausts it →
// "remaining connection slots are reserved for roles with the SUPERUSER attribute" → 500s.
// Schema-push scripts override with the non-pooled URL themselves (DDL needs a direct conn).
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_URI ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  ''

// node-postgres does not always honor sslmode=require from the URL. Neon requires
// TLS, so enable it explicitly when the connection string asks for it. The channel
// is still encrypted; rejectUnauthorized:false avoids CA-chain edge cases on
// serverless without weakening transport encryption.
const ssl = /sslmode=require/.test(connectionString)
  ? { rejectUnauthorized: false }
  : undefined

// Payload's serverURL is what the ADMIN CLIENT uses as its API base. It must be the origin
// that actually serves the app — NOT the canonical marketing domain (which may not be cut
// over yet). Empty ⇒ relative/same-origin, so the admin works from any Vercel alias or the
// final domain without cross-origin/CSP breakage. Canonical URLs use NEXT_PUBLIC_SITE_URL
// separately (SEO/email code), not this.
// serverURL is the origin the ADMIN CLIENT uses as its API base. It MUST match the origin
// actually serving the app, or the admin's client calls go cross-origin (CSP-blocked) and
// the admin renders but is inert.
//   • Default (prod): '' → relative/same-origin, so it works on ANY host that serves the app
//     — every Vercel alias today, and centrifuge.com later — with NO change at cutover.
//   • Override: set PAYLOAD_PUBLIC_SERVER_URL to pin an absolute origin (e.g. after cutover,
//     set it to https://centrifuge.com). This is the single knob to change when the domain moves.
//   • Dev: localhost so the local admin talks to the local server.
// `??` (not `||`) so an intentionally-empty override ('') is respected.
const payloadServerURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000')

// Email + storage adapters are wired only when their secrets exist, so the app
// builds and boots with placeholder env (Cycle 1). Integration is exercised once
// real keys are present.
const emailAdapter = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'notifications@centrifuge.com',
      defaultFromName: 'Centrifuge World',
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined

const storagePlugins = process.env.BLOB_READ_WRITE_TOKEN
  ? [
      vercelBlobStorage({
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    ]
  : []

export default buildConfig({
  serverURL: payloadServerURL,
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  admin: {
    user: Users.slug,
    avatar: { Component: '@/payload/admin/Avatar' },
    meta: {
      titleSuffix: '· Centrifuge World CMS',
    },
    // Sleek, on-brand admin: Industrial Blue theme injected app-wide via a
    // providers component, plus branded login logo + nav icon.
    components: {
      providers: ['@/payload/admin/BrandProvider'],
      // Full custom Mission Control sidebar — replaces Payload's default Nav entirely.
      // Brand lockup, grouped links, live pill counts, collapse-to-rail, and (critically)
      // Account + Log out affordances live inside NavClient, since the default nav's
      // logout/account links are gone once Nav is overridden.
      Nav: '@/payload/admin/Nav',
      graphics: {
        Logo: '@/payload/admin/Logo',
        Icon: '@/payload/admin/Icon',
      },
      views: {
        // Mission Control replaces the default admin landing dashboard (UI-1 Phase B).
        dashboard: { Component: '@/payload/admin/Dashboard' },
        // Leads & Quotes workspace — full-screen custom route (UI-2).
        leadsQuotes: { Component: '@/payload/admin/LeadsQuotes', path: '/leads-quotes' },
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: lexicalEditor(),
  collections: [
    Pages,
    Services,
    OEMBrands,
    Industries,
    Locations,
    Posts,
    CaseStudies,
    HowItWorks,
    Inventory,
    CompetitorSnapshots,
    FAQs,
    Media,
    FormSubmissions,
    Leads,
    Quotes,
    Redirects,
    Users,
  ],
  globals: [SiteSettings, HeaderNav, FooterNav, LeadRouting, QuoteDefaults],
  db: postgresAdapter({
    pool: { connectionString, ...(ssl ? { ssl } : {}) },
    push: process.env.NODE_ENV !== 'production',
  }),
  ...(emailAdapter ? { email: emailAdapter } : {}),
  plugins: [...storagePlugins],
  sharp,
})
