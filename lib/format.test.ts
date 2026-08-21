import { describe, expect, it } from 'vitest'
import { faNum, formatDate } from './format'

describe('faNum', () => {
  it('uses Persian digits', () => {
    expect(faNum(7)).toBe('۷')
  })

  it('does not group thousands', () => {
    // the fa-IR default renders 1380 as ۱٬۳۸۰, which is wrong for a year and
    // was shipped once before this test existed
    expect(faNum(1380)).toBe('۱۳۸۰')
    expect(faNum(1405)).toBe('۱۴۰۵')
    expect(faNum(1380)).not.toContain('٬')
  })

  it('handles zero', () => {
    expect(faNum(0)).toBe('۰')
  })
})

describe('formatDate', () => {
  it('formats in the Persian calendar', () => {
    const out = formatDate(new Date('2026-08-21T00:00:00Z'))
    expect(out).toMatch(/۱۴۰۵/)
    expect(out).toMatch(/مرداد/)
  })

  it('accepts an ISO string as well as a Date', () => {
    expect(formatDate('2026-08-21')).toBe(formatDate(new Date('2026-08-21')))
  })
})
