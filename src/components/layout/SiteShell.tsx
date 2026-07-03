import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

// Standard page frame: skip-target <main> between header and footer.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
