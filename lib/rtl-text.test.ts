import { describe, expect, it } from 'vitest'
import { zwnjSafe } from './rtl-text'

const ZWNJ = '‌'

/**
 * Satori has no bidi algorithm. The OG route works around it by laying each word
 * out as its own flex item in a row-reverse container; zwnjSafe is the same
 * workaround one level down, for the runs a ZWNJ creates inside a word.
 *
 * Without it, every Persian compound word came out with its halves swapped —
 * "سیستم‌سازی" rendered as "سازی‌سیستم" on every social card the site produced.
 */
describe('zwnjSafe', () => {
  it('leaves a word with no ZWNJ alone', () => {
    expect(zwnjSafe('مدیران')).toBe('مدیران')
  })

  it('swaps the two halves of a compound so Satori flips them back', () => {
    expect(zwnjSafe(`سیستم${ZWNJ}سازی`)).toBe(`سازی${ZWNJ}سیستم`)
  })

  it('keeps the ZWNJ itself, so the letterforms stay unjoined', () => {
    expect(zwnjSafe(`سیستم${ZWNJ}سازی`)).toContain(ZWNJ)
  })

  it('handles a word with more than one ZWNJ', () => {
    expect(zwnjSafe(`الف${ZWNJ}ب${ZWNJ}ج`)).toBe(`ج${ZWNJ}ب${ZWNJ}الف`)
  })

  it('is its own inverse, which is what makes the double flip land right', () => {
    const word = `نیم${ZWNJ}فاصله`
    expect(zwnjSafe(zwnjSafe(word))).toBe(word)
  })

  it('leaves Latin untouched', () => {
    expect(zwnjSafe('Zarfeshan')).toBe('Zarfeshan')
  })
})
