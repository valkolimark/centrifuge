import { describe, it, expect } from 'vitest'
import { evaluate, contrastRatio } from '../../../scripts/contrast-pairs'

describe('WCAG AA contrast', () => {
  it('every defined text/background pair meets its required ratio', () => {
    const failures = evaluate().filter((r) => !r.pass)
    expect(failures, failures.map((f) => `${f.name}: ${f.ratio.toFixed(2)}`).join(', ')).toHaveLength(0)
  })

  it('contrastRatio is symmetric and correct for black/white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1)
  })
})
