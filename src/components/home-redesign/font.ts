// Montserrat variable (OFL, fonts/OFL.txt), the same woff2 the approved CW landings use
// (sha256 39c5662a85bc...). Ships tnum + lnum, used for phone numbers (design-trends R22).
import localFont from 'next/font/local'

export const montserrat = localFont({
  src: './fonts/montserrat-latin-wght.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-cwh',
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
  preload: true,
})
