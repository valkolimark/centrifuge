// Self-hosted variable fonts via next/font/local (files committed in src/styles/fonts,
// served from our origin — no Google request at build time or runtime).
// Latin subset, display: swap. Archivo for headings (wght 600–800), Inter for body/UI.
// Max 2 families per CLAUDE.md.
//
// These used to come from next/font/google, which downloads from Google during the
// build. From 2026-11-23 Google intermittently returned font URLs without a file
// extension to Vercel's builders, which crashes Next 15.4's loader ("Cannot read
// properties of null (reading '1')") and failed production deploys. Do not switch back
// to next/font/google. The files are the latin-subset WOFF2s Google Fonts serves
// (Archivo v25, Inter v20; both SIL OFL 1.1).
//
// The metric-matched fallback faces ("Archivo Fallback" / "Inter Fallback") are declared
// by hand in src/styles/globals.css with the exact overrides next/font/google generated,
// so text reflow during font swap (CLS) is unchanged. next/font/local would compute
// slightly different overrides, hence `adjustFontFallback: false` here.
import localFont from 'next/font/local'

export const archivo = localFont({
  src: '../styles/fonts/archivo-latin-variable.woff2',
  weight: '600 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  fallback: ['Archivo Fallback', 'system-ui', 'sans-serif'],
  adjustFontFallback: false,
  declarations: [{ prop: 'font-stretch', value: '100%' }],
})

export const inter = localFont({
  src: '../styles/fonts/inter-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  fallback: ['Inter Fallback', 'system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: false,
})

export const fontVariables = `${archivo.variable} ${inter.variable}`
