/**
 * Page-count and page-number arithmetic for article lists.
 *
 * Lives in lib/ rather than in the component because `npm test` only collects
 * `lib/**\/*.test.ts`. The seed data is six articles, so with PER_PAGE at 12 a
 * second page never exists in development — the arithmetic has to be provable
 * without it rather than checked by clicking.
 */

/** Twelve rows is about one scroll of ArticleListItem at desktop height. */
export const PER_PAGE = 12

export function pageCount(total: number, perPage = PER_PAGE): number {
  if (total <= 0) return 1
  return Math.ceil(total / perPage)
}

/** 1-based. Out of range returns null so a route can call notFound(). */
export function pageOffset(page: number, perPage = PER_PAGE): number {
  return (page - 1) * perPage
}

/**
 * Parses a `[page]` route segment. Anything that is not a plain positive integer
 * is rejected — "01", "1.0", "1e1" and " 2" all resolve to a number in JS and
 * would otherwise serve the same content at several URLs.
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : null
}

/**
 * The numbers to render: first, last, and a window around the current page, with
 * nulls where a gap is elided. Keeps the control a fixed width however many
 * articles pile up.
 */
export function pageWindow(current: number, count: number, span = 1): (number | null)[] {
  if (count <= 1) return []

  const wanted = new Set<number>([1, count])
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= count) wanted.add(p)
  }

  const sorted = [...wanted].sort((a, b) => a - b)
  const out: (number | null)[] = []
  let previous = 0

  for (const page of sorted) {
    if (previous && page - previous > 1) out.push(null)
    out.push(page)
    previous = page
  }

  return out
}
