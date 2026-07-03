// Self-hosted variable fonts via next/font (downloaded & served from our origin at
// build time — no runtime Google request). Latin subset, display: swap.
// Archivo for headings (wght 600–800), Inter for body/UI. Max 2 families per CLAUDE.md.
import { Archivo, Inter } from 'next/font/google'

export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-archivo',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
})

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
})

export const fontVariables = `${archivo.variable} ${inter.variable}`
