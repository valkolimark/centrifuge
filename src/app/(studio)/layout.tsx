import type { Metadata } from 'next'

// Root layout for the full-screen PDF Studio workspace (UI-1 Phase E). Its own
// route group so it renders without the Payload admin chrome — dark, full-bleed.
export const metadata: Metadata = { title: 'PDF Studio · Centrifuge World', robots: { index: false } }

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#060B1A', color: '#EAF2FF', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
