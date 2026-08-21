import { describe, expect, it, vi, afterEach } from 'vitest'
import { currentJalaliYear, fa, milestones, stats, yearsSince } from './bio'

/**
 * The durations on the about page are the site's only numbers. They are computed
 * rather than written down precisely so they cannot go stale — these tests are
 * what stops someone "simplifying" that back into a literal.
 */

afterEach(() => vi.useRealTimers())

describe('currentJalaliYear', () => {
  it('converts a Gregorian date to the Persian year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'))
    expect(currentJalaliYear()).toBe(1405)
  })

  it('rolls over at Nowruz, not on 1 January', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-20T12:00:00Z'))
    expect(currentJalaliYear()).toBe(1404)
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'))
    expect(currentJalaliYear()).toBe(1405)
  })
})

describe('yearsSince', () => {
  it('counts from the start year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'))
    expect(yearsSince(1380)).toBe(25)
    expect(yearsSince(1389)).toBe(16)
  })

  it('grows by one after Nowruz — the whole point of not hardcoding it', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-08-21T12:00:00Z'))
    expect(yearsSince(1380)).toBe(26)
  })
})

describe('stats', () => {
  it('recomputes on every read rather than freezing at import time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'))
    const first = stats[0].value
    vi.setSystemTime(new Date('2028-08-21T12:00:00Z'))
    expect(stats[0].value).not.toBe(first)
  })

  it('renders years without a thousands separator', () => {
    for (const s of stats) expect(s.value).not.toContain('٬')
  })
})

describe('milestones', () => {
  it('is ordered oldest first', () => {
    const years = milestones.map((m) => m.year)
    expect([...years].sort((a, b) => a - b)).toEqual(years)
  })

  it('states no figure that was never supplied', () => {
    // no revenue, headcount or percentage claims may appear in the copy
    for (const m of milestones) {
      expect(m.body).not.toMatch(/\d+\s*(٪|%|درصد|میلیون|میلیارد|نفر)/)
    }
  })
})

describe('fa', () => {
  it('formats a year plainly', () => {
    expect(fa(1397)).toBe('۱۳۹۷')
  })
})
