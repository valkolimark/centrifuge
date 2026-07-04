// Registered at admin.components.providers so it wraps every admin screen (incl.
// login). Self-hosts the Mission Control fonts via next/font (no runtime hot-link)
// and injects the dark admin theme. The font CSS variables cascade to all admin UI.
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google'
import './brand.css'

const display = Chakra_Petch({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' })

export default function BrandProvider({ children }: { children: React.ReactNode }) {
  return <div className={`cw-admin ${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>
}
