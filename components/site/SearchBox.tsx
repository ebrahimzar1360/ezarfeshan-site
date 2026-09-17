'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { inputClass } from '@/components/ui/FormField'
import { SEARCH_ERROR, useArticleSearch } from '@/lib/hooks/useArticleSearch'

function Inner() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get('q') ?? ''

  const { query, setQuery, results, state } = useArticleSearch()

  // Seed from ?q= once. The hook owns the query from then on; passing `initial`
  // into it as an initial value would reset the box whenever the URL effect
  // below rewrote the address.
  const [seeded, setSeeded] = useState(false)
  useEffect(() => {
    if (!seeded) {
      if (initial) setQuery(initial)
      setSeeded(true)
    }
  }, [seeded, initial, setQuery])

  // keep the URL shareable without pushing a history entry per keystroke
  useEffect(() => {
    if (!seeded) return
    const q = query.trim()
    const next = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
    router.replace(next, { scroll: false })
  }, [query, router, seeded])

  return (
    <div className="max-w-(--container-measure)">
      <label htmlFor="q" className="sr-only">
        جست‌وجو در مقالات
      </label>
      <input
        id="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="مثلاً: سیستم‌سازی"
        autoComplete="off"
        className={inputClass}
      />

      <div aria-live="polite" className="mt-8">
        {state === 'searching' && <p className="text-300 text-text-subtle">در حال جست‌وجو…</p>}

        {state === 'error' && (
          <p role="alert" className="text-300 font-medium text-text">
            <span aria-hidden className="me-1.5 text-accent">▲</span>
            {SEARCH_ERROR}
          </p>
        )}

        {state === 'done' && results?.length === 0 && (
          <div className="rounded-lg border border-border bg-bg-sunken px-6 py-8">
            <p className="text-400 font-bold text-text">برای «{query.trim()}» چیزی پیدا نشد</p>
            <p className="mt-3 text-300 leading-prose text-text-muted">
              املا را بررسی کن، یا کلمهٔ کوتاه‌تری امتحان کن.
            </p>
            <p className="mt-5">
              <Link href="/articles" className="text-300 font-medium">
                همهٔ مقالات ←
              </Link>
            </p>
          </div>
        )}

        {state === 'done' && results && results.length > 0 && (
          <>
            <p className="mb-2 text-200 text-text-subtle">
              {results.length.toLocaleString('fa-IR', { useGrouping: false })} نتیجه
            </p>
            <ul>
              {results.map((r) => (
                <li key={r.slug} className="border-t border-border">
                  <Link href={`/articles/${r.slug}`} className="block py-6 no-underline">
                    <p className="text-500 font-bold text-text">{r.title}</p>
                    <p className="mt-2 text-300 leading-normal text-text-muted">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export function SearchBox() {
  return (
    <Suspense fallback={<p className="text-300 text-text-subtle">…</p>}>
      <Inner />
    </Suspense>
  )
}
