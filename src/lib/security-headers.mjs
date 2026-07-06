// Security headers for centrifuge.com (Cycle 1, task 1.6).
// CSP allows GTM/GA (@next/third-parties) and Cloudflare Turnstile, and nothing else third-party.
// Reused by next.config.mjs. Kept as .mjs so next.config can import without a TS build step.

const gtm = 'https://www.googletagmanager.com'
const ga = 'https://www.google-analytics.com https://region1.google-analytics.com'
const turnstile = 'https://challenges.cloudflare.com'
const blob = 'https://*.public.blob.vercel-storage.com'
const s3media = 'https://centrifuge-im.s3.amazonaws.com'
// YouTube (feature video + /resources/videos gallery, click-to-load facade).
const youtube = 'https://www.youtube-nocookie.com https://www.youtube.com'
const ytimg = 'https://i.ytimg.com'

// NOTE: 'unsafe-inline' on script-src is required by GTM's bootstrap snippet loaded via
// @next/third-parties. Tightening to a nonce is tracked in BACKLOG.md.
// Next.js dev mode (fast refresh / eval source maps) needs 'unsafe-eval'; production never does.
const devEval = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"

// HTTPS-only hardening (HSTS + upgrade-insecure-requests) must be emitted ONLY on real
// https deploys. Vercel sets VERCEL=1 in the build environment for every (https) prod/preview
// deploy — that is the correct discriminator, NOT NODE_ENV, which is also 'production' for a
// local prod build (`pnpm build && pnpm start`). If emitted over local http these upgrade every
// subresource to https (blank page, no TLS) and — worse — HSTS `preload` poisons the browser's
// localhost policy for 2 years. Use http://127.0.0.1:3210 to escape an already-cached policy.
const httpsDeploy = process.env.VERCEL === '1'
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'self'`,
  `form-action 'self'`,
  `img-src 'self' data: blob: ${blob} ${s3media} ${ytimg} ${gtm} ${ga} https://www.google.com https://maps.googleapis.com https://maps.gstatic.com`,
  `script-src 'self' 'unsafe-inline'${devEval} ${gtm} ${turnstile}`,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self' data:`,
  `connect-src 'self' ${gtm} ${ga} ${turnstile} ${blob}`,
  `frame-src 'self' ${turnstile} ${youtube} https://www.google.com https://td.doubleclick.net`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  // Force HTTPS on real https deploys only (see httpsDeploy note above); locally over http
  // this upgrades every subresource to https and blanks the page.
  ...(httpsDeploy ? [`upgrade-insecure-requests`] : []),
].join('; ')

export const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // HSTS only on real https deploys. Its `preload; includeSubDomains` would otherwise poison
  // the browser's localhost policy for 2 years when testing a local prod build over http.
  ...(httpsDeploy
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  // Admin (/admin) must be same-origin framable for Payload live preview; SAMEORIGIN keeps
  // the rest of the site frame-safe while allowing it. frame-ancestors 'self' backs this up.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]
