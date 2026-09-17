'use client'

import { useEffect, useState } from 'react'

export type SearchResult = { slug: string; title: string; excerpt: string }
export type SearchState = 'idle' | 'searching' | 'done' | 'error'

/** Shared with the command palette so both say the same thing when it breaks. */
export const SEARCH_ERROR = 'جست‌وجو انجام نشد. چند لحظه بعد دوباره تلاش کن.'

/** Below this, a trigram match is noise rather than a result. */
const MIN_QUERY = 2

/** Each keystroke is a trigram scan on the database; this is the throttle. */
const DEBOUNCE_MS = 300

/**
 * The search behaviour behind /search and the ⌘K palette.
 *
 * Lifted verbatim out of SearchBox.tsx rather than rewritten — all three parts
 * are deliberate and were easy to lose in a second implementation:
 *
 * - the two-character floor, so a single Persian letter never reaches Postgres
 * - the 300ms debounce, because /api/search runs a pg_trgm similarity scan
 * - the AbortController, whose AbortError is *swallowed* rather than surfaced.
 *   A cancelled request is the normal case while someone is typing; showing it
 *   as a failure would flash the error line on every keystroke.
 */
export function useArticleSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [state, setState] = useState<SearchState>('idle')

  useEffect(() => {
    const q = query.trim()
    if (q.length < MIN_QUERY) {
      setResults(null)
      setState('idle')
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState('searching')
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const body = await res.json()
        if (!body.ok) throw new Error('search failed')
        setResults(body.data.results)
        setState('done')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setState('error')
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { query, setQuery, results, state }
}
