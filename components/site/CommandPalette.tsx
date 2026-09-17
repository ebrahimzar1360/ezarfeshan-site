'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { SEARCH_ERROR, useArticleSearch } from '@/lib/hooks/useArticleSearch'
import { legalNav, nav } from '@/lib/site'

type Item = { href: string; label: string; hint?: string }

const ROUTES: Item[] = [
  { href: '/', label: 'صفحهٔ اصلی' },
  ...nav.map((n) => ({ href: n.href, label: n.label })),
  { href: '/newsletter', label: 'خبرنامه' },
  { href: '/consult', label: 'درخواست مشاوره' },
  ...legalNav.map((n) => ({ href: n.href, label: n.label })),
]

/**
 * ⌘K / Ctrl+K palette over the search API the site already has.
 *
 * Not built on `cmdk`: that is 8 kB plus a Radix dialog, and its fuzzy scorer is
 * tuned for Latin text — it ranks poorly across ZWNJ and Arabic presentation
 * forms. /api/search already does trigram matching in Postgres, which is the
 * right tool for this content. See docs/UX-OVERHAUL.md §4.
 *
 * Selection moves with aria-activedescendant, not by moving DOM focus. Focus has
 * to stay in the input or typing stops working — the mistake most hand-rolled
 * palettes make. Only ArrowUp/ArrowDown are bound: left and right mean opposite
 * things in an RTL document and binding them invites exactly one bug report.
 */
export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const { query, setQuery, results, state } = useArticleSearch()
  const q = query.trim()

  const routeMatches = useMemo(
    () => (q ? ROUTES.filter((r) => r.label.includes(q)) : ROUTES.slice(0, 5)),
    [q]
  )

  const items: Item[] = useMemo(
    () => [
      ...routeMatches,
      ...(results ?? []).map((r) => ({
        href: `/articles/${r.slug}`,
        label: r.title,
        hint: r.excerpt,
      })),
    ],
    [routeMatches, results]
  )

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'k' || !(e.metaKey || e.ctrlKey)) return
      // Never steal the shortcut from someone mid-sentence in a form.
      const el = document.activeElement
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return
      }
      e.preventDefault()
      setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [setQuery])

  const go = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router]
  )

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = items[active]
      if (item) go(item.href)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن جست‌وجوی سریع"
        className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text"
      >
        <span aria-hidden className="text-300">⌕</span>
      </button>

      <Sheet open={open} onClose={close} label="جست‌وجوی سریع">
        <div
          className="mx-auto mt-[8vh] flex max-h-[70vh] w-[min(38rem,92vw)] flex-col overflow-hidden rounded-lg border border-border bg-bg-raised shadow-(--shadow)"
          // clicks inside must not reach the dialog element, which closes on
          // backdrop clicks
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <span aria-hidden className="text-400 text-text-subtle">⌕</span>
            <label htmlFor={`${listId}-input`} className="sr-only">
              {/* Three distinct names on purpose: the trigger is "باز کردن
                  جست‌وجوی سریع", the dialog is "جست‌وجوی سریع", and the field is
                  this. Reusing one string across all three would leave a screen
                  reader announcing the same name for a button, a dialog and an
                  input — and it made getByLabel resolve to three elements.

                  Also deliberately NOT "جست‌وجو در مقالات": that is the label of
                  #q on /search, which e2e reaches with getByLabel. */}
              عبارت جست‌وجو
            </label>
            <input
              id={`${listId}-input`}
              ref={inputRef}
              autoFocus
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="مقاله یا بخشی از سایت…"
              autoComplete="off"
              className="h-14 flex-1 bg-transparent text-400 text-text outline-none placeholder:text-text-subtle"
            />
            <kbd className="latin hidden rounded-sm border border-border px-1.5 py-0.5 text-200 text-text-subtle sm:block">
              Esc
            </kbd>
          </div>

          <div className="overflow-y-auto p-2">
            {state === 'error' && (
              <p className="px-3 py-4 text-300 font-medium text-text">
                <span aria-hidden className="me-1.5 text-accent">▲</span>
                {SEARCH_ERROR}
              </p>
            )}

            {state !== 'error' && items.length === 0 && (
              <p className="px-3 py-6 text-300 text-text-muted">
                {q ? `برای «${q}» چیزی پیدا نشد` : 'چیزی برای نمایش نیست'}
              </p>
            )}

            <ul id={listId} role="listbox" aria-label="نتیجه‌ها">
              {items.map((item, i) => (
                <li
                  key={`${item.href}-${i}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item.href)}
                  className={`cursor-pointer rounded-md px-3 py-2.5 ${
                    i === active ? 'gold-marker bg-accent/10' : ''
                  }`}
                >
                  <p className="text-300 font-medium text-text">{item.label}</p>
                  {item.hint && (
                    <p className="mt-1 line-clamp-1 text-200 text-text-muted">{item.hint}</p>
                  )}
                </li>
              ))}
            </ul>

            {state === 'searching' && (
              <p className="px-3 py-3 text-200 text-text-subtle">در حال جست‌وجو…</p>
            )}
          </div>
        </div>
      </Sheet>
    </>
  )
}
