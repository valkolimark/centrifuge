// Security headers for centrifuge.com (Cycle 1, task 1.6).
// CSP allows GTM/GA (@next/third-parties) and Cloudflare Turnstile, and nothing else third-party.
// Reused by next.config.mjs. Kept as .mjs so next.config can import without a TS build step.

const gtm = 'https://www.googletagmanager.com'
const ga = 'https://www.google-analytics.com https://region1.google-analytics.com'
const turnstile = 'https://challenges.cloudflare.com'
const blob = 'https://*.public.blob.vercel-storage.com'
const s3media = 'https://centrifuge-im.s3.amazonaws.com'
// Cognito Forms (legacy /cw-ez-quote-for-sales/ EZ Quote embed).
const cognito = 'https://www.cognitoforms.com https://*.cognitoforms.com'
// YouTube (feature video + /resources/videos gallery, click-to-load facade).
const youtube = 'https://www.youtube-nocookie.com https://www.youtube.com'
const ytimg = 'https://i.ytimg.com'

// NOTE: 'unsafe-inline' on script-src is required by GTM's bootstrap snippet loaded via
// @next/third-parties. Tightening to a nonce is tracked in BACKLOG.md.
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'self'`,
  `form-action 'self'`,
  `img-src 'self' data: blob: ${blob} ${s3media} ${ytimg} ${cognito} ${gtm} ${ga} https://www.google.com https://maps.googleapis.com https://maps.gstatic.com`,
  `script-src 'self' 'unsafe-inline' ${gtm} ${turnstile} ${cognito}`,
  `style-src 'self' 'unsafe-inline' ${cognito}`,
  `font-src 'self' data: ${cognito}`,
  `connect-src 'self' ${gtm} ${ga} ${turnstile} ${blob} ${cognito}`,
  `frame-src 'self' ${turnstile} ${cognito} ${youtube} https://www.google.com https://td.doubleclick.net`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
].join('; ')

export const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
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
