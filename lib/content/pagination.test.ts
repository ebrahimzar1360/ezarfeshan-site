import { describe, expect, it } from 'vitest'
import { PER_PAGE, pageCount, pageOffset, pageWindow, parsePageParam } from './pagination'

describe('pageCount', () => {
  it('is one page when there is nothing to show', () => {
    // An empty list still renders a page — it renders the empty state.
    expect(pageCount(0)).toBe(1)
  })

  it('keeps a partial page', () => {
    expect(pageCount(PER_PAGE + 1)).toBe(2)
  })

  it('does not add an empty page on an exact multiple', () => {
    expect(pageCount(PER_PAGE * 3)).toBe(3)
  })

  it('leaves the seeded six articles on a single page', () => {
    // Guards the decision not to lower PER_PAGE to fit the seed data.
    expect(pageCount(6)).toBe(1)
  })
})

describe('pageOffset', () => {
  it('starts the first page at zero', () => {
    expect(pageOffset(1)).toBe(0)
  })

  it('skips a whole page each step', () => {
    expect(pageOffset(3)).toBe(PER_PAGE * 2)
  })
})

describe('parsePageParam', () => {
  it('accepts a plain positive integer', () => {
    expect(parsePageParam('2')).toBe(2)
    expect(parsePageParam('10')).toBe(10)
  })

  it('rejects every spelling that would duplicate a page at another URL', () => {
    // Each of these is a valid Number() but a different string, so accepting it
    // would serve identical content at two addresses.
    for (const raw of ['01', '1.0', '1e1', ' 2', '2 ', '+2', '-1', '0', '', 'x']) {
      expect(parsePageParam(raw), raw).toBeNull()
    }
  })

  it('rejects a number too large to be exact', () => {
    expect(parsePageParam('9'.repeat(20))).toBeNull()
  })
})

describe('pageWindow', () => {
  it('renders nothing when there is only one page', () => {
    expect(pageWindow(1, 1)).toEqual([])
  })

  it('lists every page while they still fit', () => {
    expect(pageWindow(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('elides the middle when far from both ends', () => {
    expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12])
  })

  it('does not put a gap marker where only one page is missing', () => {
    // 1 … 3 4 5 … 7 would hide exactly one number behind each gap; show it.
    expect(pageWindow(4, 6)).toEqual([1, null, 3, 4, 5, 6])
  })

  it('stays anchored at the first and last page', () => {
    expect(pageWindow(1, 20)[0]).toBe(1)
    expect(pageWindow(20, 20).at(-1)).toBe(20)
  })
})
