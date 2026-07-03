// Single source of truth for the color values (mirrors src/styles/tokens.css)
// and the text/background pairs that must pass WCAG AA. Imported by both the
// CLI (check-contrast.ts) and the vitest gate (contrast.test.ts).

// "Web Blue" palette (client-selected). Monochromatic blue ramp + black/white,
// with a bright red reserved for warnings & emergencies.
export const palette = {
  // Brand blue ramp (light → dark)
  blueBright: '#00B8FF', // brightest accent (dark surfaces, dark-mode links, glows)
  blueMid: '#009BD6', // accent / large text only
  blue: '#00719C', // primary interactive: links, buttons, focus (AA on white)
  navy: '#00415A', // headings, primary dark surfaces
  blueDeep: '#001F2B', // footer, hero overlays, deepest surface
  // Neutrals (cool, blue-tinted to harmonize) + true black/white
  steel100: '#EEF3F6',
  steel300: '#C2D0D8',
  steel500: '#5C7078',
  steel700: '#16303B',
  white: '#FFFFFF',
  black: '#000000',
  // Functional
  safety: '#E11900', // BRIGHT RED — emergencies & warnings (repurposed token)
  success: '#1E8E5A',
  error: '#D32F2F',
  link: '#00719C',
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
  { name: 'white on blue (primary button)', fg: palette.white, bg: palette.blue, level: 'normal' },
  { name: 'white on navy', fg: palette.white, bg: palette.navy, level: 'normal' },
  { name: 'white on blue-deep', fg: palette.white, bg: palette.blueDeep, level: 'normal' },
  { name: 'blue-bright on blue-deep (dark-mode accent)', fg: palette.blueBright, bg: palette.blueDeep, level: 'normal' },
  { name: 'navy on steel-300 (border/chip)', fg: palette.navy, bg: palette.steel300, level: 'normal' },
  { name: 'black on white', fg: palette.black, bg: palette.white, level: 'normal' },
  { name: 'white on black', fg: palette.white, bg: palette.black, level: 'normal' },
  // Bright red reserved for emergencies/warnings — white CTA text verified at normal size.
  { name: 'white on safety/red (emergency CTA)', fg: palette.white, bg: palette.safety, level: 'normal' },
  { name: 'white on success', fg: palette.white, bg: palette.success, level: 'large' },
  { name: 'white on error', fg: palette.white, bg: palette.error, level: 'normal' },
  { name: 'muted (steel-500) on white', fg: palette.steel500, bg: palette.white, level: 'normal' },
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
