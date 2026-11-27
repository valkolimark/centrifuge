// Registered at admin.components.providers so it wraps every admin screen (incl.
// login). Self-hosts the Mission Control fonts via next/font (no runtime hot-link)
// and injects the dark admin theme. The font CSS variables cascade to all admin UI.
//
// The font files are committed in ./fonts and loaded with next/font/local, NOT
// next/font/google. next/font/google downloads from Google at build time, and from
// 2026-11-23 Google returned font URLs without a file extension to Vercel's builders,
// which crashes Next 15.4's loader ("Cannot read properties of null (reading '1')")
// and failed every deployment. Local files make the build independent of Google.
// Files are the latin-subset WOFF2s Google Fonts serves (all SIL OFL 1.1):
// Chakra Petch v13 (static 400–700), Inter v20 (variable), JetBrains Mono v24 (variable).
import localFont from 'next/font/local'
import './brand.css'

const display = localFont({
  src: [
    { path: './fonts/chakra-petch-latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/chakra-petch-latin-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/chakra-petch-latin-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/chakra-petch-latin-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})
const body = localFont({
  src: './fonts/inter-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-body',
  display: 'swap',
})
const mono = localFont({
  src: './fonts/jetbrains-mono-latin-variable.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono',
  display: 'swap',
})

export default function BrandProvider({ children }: { children: React.ReactNode }) {
  return <div className={`cw-admin ${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>
}
