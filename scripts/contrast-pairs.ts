// Single source of truth for the color values (mirrors src/styles/tokens.css)
// and the text/background pairs that must pass WCAG AA. Imported by both the
// CLI (check-contrast.ts) and the vitest gate (contrast.test.ts).

export const palette = {
  navy: '#0B3A6B',
  blue: '#1E6FD9',
  blueDeep: '#072546',
  steel100: '#F4F6F8',
  steel300: '#C9D2DB',
  steel500: '#6B7A89',
  steel700: '#2E3A45',
  safety: '#F26A1B',
  white: '#FFFFFF',
  success: '#1E8E5A',
  error: '#C6362C',
  link: '#1257AD',
} as const

type Hex = string

// 'normal' body text requires 4.5:1; 'large' (>=18.66px bold or 24px) requires 3:1.
export type Level = 'normal' | 'large'

export interface Pair {
  name: string
  fg: Hex
  bg: Hex
  level: Level
}

export const pairs: Pair[] = [
  { name: 'body text on white', fg: palette.steel700, bg: palette.white, level: 'normal' },
  { name: 'body text on steel-100', fg: palette.steel700, bg: palette.steel100, level: 'normal' },
  { name: 'heading (navy) on white', fg: palette.navy, bg: palette.white, level: 'normal' },
  { name: 'heading (navy) on steel-100', fg: palette.navy, bg: palette.steel100, level: 'normal' },
  { name: 'link on white', fg: palette.link, bg: palette.white, level: 'normal' },
  { name: 'link on steel-100', fg: palette.link, bg: palette.steel100, level: 'normal' },
  { name: 'white on navy', fg: palette.white, bg: palette.navy, level: 'normal' },
  { name: 'white on blue-deep', fg: palette.white, bg: palette.blueDeep, level: 'normal' },
  { name: 'white on blue (primary button)', fg: palette.white, bg: palette.blue, level: 'large' },
  { name: 'navy on steel-300 (border/chip)', fg: palette.navy, bg: palette.steel300, level: 'normal' },
  // Safety orange is reserved for emergency CTAs (large, bold) — verified at large level.
  { name: 'white on safety (emergency CTA)', fg: palette.white, bg: palette.safety, level: 'large' },
  // navy-on-safety only appears as a large bold label/icon; emergency CTA body text is white.
  { name: 'navy on safety (large label only)', fg: palette.navy, bg: palette.safety, level: 'large' },
  { name: 'white on success', fg: palette.white, bg: palette.success, level: 'large' },
  { name: 'white on error', fg: palette.white, bg: palette.error, level: 'normal' },
  { name: 'muted (steel-500) on white — UI/large', fg: palette.steel500, bg: palette.white, level: 'large' },
]

function toLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: Hex): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function contrastRatio(fg: Hex, bg: Hex): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function requiredRatio(level: Level): number {
  return level === 'large' ? 3.0 : 4.5
}

export interface Result extends Pair {
  ratio: number
  required: number
  pass: boolean
}

export function evaluate(): Result[] {
  return pairs.map((p) => {
    const ratio = contrastRatio(p.fg, p.bg)
    const required = requiredRatio(p.level)
    return { ...p, ratio, required, pass: ratio >= required }
  })
}
