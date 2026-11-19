import localFont from 'next/font/local'

// Hosted Montserrat for the email landing pages only (SIL OFL 1.1, see fonts/OFL.txt). Variable wght 100 to 900,
// Latin subset, woff2. Same file and subset as the approved static previews' hosted font swap
// (_build/font-swap in the Nov 23-30 campaign). next/font self-hosts it from our origin and keeps a
// metric-matched Arial fallback. The rest of the site keeps Archivo + Inter.
export const emailLandingFont = localFont({
  src: './fonts/montserrat-latin-wght.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-email-landing',
  adjustFontFallback: 'Arial',
})
