'use client'

import Link from 'next/link'
import { useState } from 'react'
import { fa } from '@/lib/content/bio'

export type DiagnosisItem = {
  text: string
  cause: string
  why: string
  article: { slug: string; title: string; readingMinutes: number } | null
}

/**
 * The self-check: the visitor ticks the sentences that are true for them and
 * the panel beside the list names each cause and points at the article that
 * deals with it.
 *
 * It ends on reading, not on a sales pitch — the homepage already asks for a
 * consultation in the hero, the "how I work" block and the footer (owner,
 * 1405/07). An article that is not published yet is simply not linked; the
 * cause and its one-line explanation still show.
 *
 * Real checkboxes inside labels, so it works with a keyboard and a screen
 * reader; the result panel is a polite live region.
 */
export function DiagnosisCheck({ items }: { items: DiagnosisItem[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false))
  const count = checked.filter(Boolean).length
  const toggle = (i: number) => setChecked((c) => c.map((v, k) => (k === i ? !v : v)))

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <fieldset>
        <legend className="sr-only">جمله‌هایی که دربارهٔ کسب‌وکار شما درست است</legend>
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={it.text}>
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-400 transition-[background-color,border-color] duration-200 ${
                  checked[i]
                    ? 'border-gold bg-gold/12'
                    : 'border-border-strong bg-bg-raised hover:border-gold/50'
                }`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked[i] ?? false}
                  onChange={() => toggle(i)}
                />
                <span
                  aria-hidden
                  className={`grid size-7 flex-none place-items-center rounded-md border-2 text-300 font-black transition-[background-color,border-color,color] duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${
                    checked[i]
                      ? 'border-gold bg-gold text-forest-deep'
                      : 'border-border-strong text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="text-text">{it.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="rounded-xl border border-border bg-bg-raised/60 p-6 md:p-7" aria-live="polite">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-300 text-text-muted">وابستگی کسب‌وکار به شما</p>
          <p className="text-700 font-black text-gold-light">
            {fa(count)} از {fa(items.length)}
          </p>
        </div>
        <div aria-hidden className="mt-3 h-2.5 overflow-hidden rounded-sm bg-border">
          <div
            className="h-full rounded-sm bg-gold transition-[width] duration-500 ease-brand"
            style={{ width: `${(count / items.length) * 100}%` }}
          />
        </div>

        {count === 0 ? (
          <p className="mt-8 text-300 leading-prose text-text-subtle">
            جمله‌ها را بزنید تا علت‌ها و جای شروع را ببینید.
          </p>
        ) : (
          <>
            <p className="mt-6 text-300 text-text-muted">
              علت‌هایی که در کسب‌وکار شما هست — و از کجا شروع کنید:
            </p>
            <ul className="mt-3 space-y-2.5">
              {items.map((it, i) =>
                checked[i] ? (
                  <li key={it.cause} className="rise-in">
                    <Cause item={it} />
                  </li>
                ) : null,
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function Cause({ item }: { item: DiagnosisItem }) {
  const body = (
    <>
      <span className="flex-1">
        <span className="block text-200 font-bold text-gold-light">{item.cause}</span>
        {item.article ? (
          <>
            <span className="mt-1 block text-400 font-bold leading-snug text-text">
              {item.article.title}
            </span>
            <span className="mt-1 block text-200 text-text-subtle">
              مقاله · {fa(item.article.readingMinutes)} دقیقه مطالعه
            </span>
          </>
        ) : (
          <span className="mt-1 block text-300 leading-snug text-text-muted">{item.why}</span>
        )}
      </span>
      {item.article && (
        <span aria-hidden className="flex-none text-300 font-bold text-gold-light">
          خواندن ←
        </span>
      )}
    </>
  )
  const box = 'flex items-center gap-4 rounded-lg border border-border bg-bg/40 px-4 py-3.5'
  return item.article ? (
    <Link
      href={`/articles/${item.article.slug}`}
      className={`${box} no-underline transition-colors duration-150 hover:border-gold/60`}
    >
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  )
}
