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
import { Inventory } from './payload/collections/Inventory'
import { FAQs } from './payload/collections/FAQs'
import { FormSubmissions } from './payload/collections/FormSubmissions'
import { Redirects } from './payload/collections/Redirects'
import { SiteSettings } from './payload/globals/SiteSettings'
import { HeaderNav } from './payload/globals/HeaderNav'
import { FooterNav } from './payload/globals/FooterNav'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Prefer the non-pooled Neon URL for reliable DDL/schema push; fall back through
// the other names Neon/CLAUDE.md may provide.
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URI ||
  process.env.DATABASE_URL ||
  ''

// node-postgres does not always honor sslmode=require from the URL. Neon requires
// TLS, so enable it explicitly when the connection string asks for it. The channel
// is still encrypted; rejectUnauthorized:false avoids CA-chain edge cases on
// serverless without weakening transport encryption.
const ssl = /sslmode=require/.test(connectionString)
  ? { rejectUnauthorized: false }
  : undefined

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
  serverURL: siteUrl,
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '· Centrifuge World CMS',
    },
    // Sleek, on-brand admin: Industrial Blue theme injected app-wide via a
    // providers component, plus branded login logo + nav icon.
    components: {
      providers: ['@/payload/admin/BrandProvider'],
      graphics: {
        Logo: '@/payload/admin/Logo',
        Icon: '@/payload/admin/Icon',
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
    Inventory,
    FAQs,
    Media,
    FormSubmissions,
    Redirects,
    Users,
  ],
  globals: [SiteSettings, HeaderNav, FooterNav],
  db: postgresAdapter({
    pool: { connectionString, ...(ssl ? { ssl } : {}) },
    push: process.env.NODE_ENV !== 'production',
  }),
  ...(emailAdapter ? { email: emailAdapter } : {}),
  plugins: [...storagePlugins],
  sharp,
})
