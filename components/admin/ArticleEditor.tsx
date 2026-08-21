'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { saveArticle, type ActionResult } from '@/lib/admin/actions'

export type ArticleDraft = {
  id?: string
  slug: string
  title: string
  excerpt: string
  body: string
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
  publishedAt: string
  featured: boolean
  coverImage: string
  seoTitle: string
  seoDescription: string
  topicIds: string[]
}

type Topic = { id: string; name: string }

const STATUS_LABELS = {
  DRAFT: 'پیش‌نویس',
  SCHEDULED: 'زمان‌بندی‌شده',
  PUBLISHED: 'منتشرشده',
} as const

/**
 * Article editor.
 *
 * Autosave only ever writes DRAFT articles. Saving a published post every few
 * seconds would push half-finished edits live, so a published article is only
 * written when the button is pressed — the status field is what decides, not a
 * separate toggle the user has to remember.
 */
export function ArticleEditor({
  initial,
  topics,
}: {
  initial: ArticleDraft
  topics: Topic[]
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<ArticleDraft>(initial)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  // compared against the live draft to decide whether anything needs saving
  const savedRef = useRef(JSON.stringify(initial))

  function set<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const save = useCallback(
    async (silent: boolean) => {
      if (!silent) setBusy(true)
      const payload = {
        ...draft,
        publishedAt: draft.publishedAt || undefined,
        coverImage: draft.coverImage || undefined,
        seoTitle: draft.seoTitle || undefined,
        seoDescription: draft.seoDescription || undefined,
      }
      const res = await saveArticle(payload)
      if (!silent) setBusy(false)

      if (res.ok) {
        if (silent) {
          savedRef.current = JSON.stringify(draft)
          setAutosavedAt(new Date().toLocaleTimeString('fa-IR'))
        } else {
          setResult(res)

          if (!draft.id && res.id) {
            // A new article. router.replace() here would navigate from
            // /articles/new to /articles/[id], remounting this component and
            // throwing away the "saved" message the writer just earned — they
            // pressed save and saw nothing happen. Adopt the id in local state
            // and rewrite the address bar without a Next navigation, so the
            // next save is an update and the confirmation survives.
            const saved = { ...draft, id: res.id }
            setDraft(saved)
            savedRef.current = JSON.stringify(saved)
            window.history.replaceState(null, '', `/admin/articles/${res.id}`)
          } else {
            savedRef.current = JSON.stringify(draft)
            router.refresh()
          }
        }
      } else if (!silent) {
        setResult(res)
      }
      return res
    },
    [draft, router]
  )

  // Autosave drafts every 20s. Published posts are excluded on purpose.
  useEffect(() => {
    if (draft.status !== 'DRAFT') return
    const timer = setInterval(() => {
      if (JSON.stringify(draft) === savedRef.current) return
      if (!draft.title.trim() || !draft.slug.trim() || draft.body.length < 1) return
      void save(true)
    }, 20000)
    return () => clearInterval(timer)
  }, [draft, save])

  // Warn before losing unsaved work.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (JSON.stringify(draft) !== savedRef.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [draft])

  const fields = result && !result.ok ? result.fields : undefined

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save(false)
      }}
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        <FormField id="title" label="عنوان" required error={fields?.title}>
          <input
            id="title"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          id="slug"
          label="اسلاگ"
          required
          hint="فقط حروف کوچک لاتین، عدد و خط تیره. بعد از انتشار عوضش نکن — لینک‌های قبلی می‌شکنند."
          error={fields?.slug}
        >
          <input
            id="slug"
            dir="ltr"
            value={draft.slug}
            onChange={(e) => set('slug', e.target.value)}
            className={`latin ${inputClass}`}
          />
        </FormField>

        <FormField
          id="excerpt"
          label="خلاصه"
          required
          hint="در فهرست مقالات و نتایج گوگل دیده می‌شود."
          error={fields?.excerpt}
        >
          <textarea
            id="excerpt"
            rows={3}
            value={draft.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            className={`${textareaClass} min-h-24`}
          />
        </FormField>

        <div>
          <div className="mb-2 flex items-center gap-1 border-b border-border">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 text-300 ${
                  tab === t
                    ? 'border-accent font-medium text-text'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                {t === 'write' ? 'نوشتن' : 'پیش‌نمایش'}
              </button>
            ))}
            <span className="ms-auto text-200 text-text-subtle">MDX</span>
          </div>

          {tab === 'write' ? (
            <textarea
              id="body"
              dir="rtl"
              value={draft.body}
              onChange={(e) => set('body', e.target.value)}
              className={`${textareaClass} min-h-[32rem] font-mono`}
              spellCheck={false}
            />
          ) : (
            <Preview body={draft.body} />
          )}
          {fields?.body && (
            <p role="alert" className="mt-2 text-200 font-medium text-text">
              <span aria-hidden className="me-1.5 text-accent">▲</span>
              {fields.body}
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-bg p-5">
          <FormField id="status" label="وضعیت" required>
            <select
              id="status"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as ArticleDraft['status'])}
              className={inputClass}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          {draft.status !== 'DRAFT' && (
            <div className="mt-5">
              <FormField
                id="publishedAt"
                label="تاریخ انتشار"
                hint={draft.status === 'SCHEDULED' ? 'تا این زمان روی سایت دیده نمی‌شود.' : undefined}
                error={fields?.publishedAt}
              >
                <input
                  id="publishedAt"
                  type="datetime-local"
                  dir="ltr"
                  value={draft.publishedAt}
                  onChange={(e) => set('publishedAt', e.target.value)}
                  className={`latin ${inputClass}`}
                />
              </FormField>
            </div>
          )}

          <label className="mt-5 flex items-center gap-2.5 text-300 text-text">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="size-4"
            />
            مقالهٔ شاخص صفحهٔ اصلی
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 h-12 w-full rounded-md bg-solid-bg text-300 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
          >
            {busy ? 'در حال ذخیره…' : 'ذخیره'}
          </button>

          {result && (
            <p
              role="status"
              className={`mt-3 text-200 ${result.ok ? 'text-text-muted' : 'font-medium text-text'}`}
            >
              {!result.ok && <span aria-hidden className="me-1.5 text-accent">▲</span>}
              {result.message}
            </p>
          )}

          {autosavedAt && draft.status === 'DRAFT' && (
            <p className="mt-2 text-200 text-text-subtle">
              ذخیرهٔ خودکار: <span className="latin">{autosavedAt}</span>
            </p>
          )}
          {draft.status !== 'DRAFT' && (
            <p className="mt-2 text-200 leading-normal text-text-subtle">
              ذخیرهٔ خودکار فقط برای پیش‌نویس کار می‌کند — تا ویرایش نیمه‌کاره روی سایت
              منتشرشده نرود.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-bg p-5">
          <p className="mb-3 text-300 font-medium text-text">موضوع‌ها</p>
          {topics.length === 0 ? (
            <p className="text-200 text-text-subtle">هنوز موضوعی نساخته‌ای.</p>
          ) : (
            <div className="space-y-2.5">
              {topics.map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 text-300 text-text">
                  <input
                    type="checkbox"
                    checked={draft.topicIds.includes(t.id)}
                    onChange={(e) =>
                      set(
                        'topicIds',
                        e.target.checked
                          ? [...draft.topicIds, t.id]
                          : draft.topicIds.filter((id) => id !== t.id)
                      )
                    }
                    className="size-4"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <details className="rounded-lg border border-border bg-bg p-5">
          <summary className="cursor-pointer text-300 font-medium text-text">سئو</summary>
          <div className="mt-5 space-y-5">
            <FormField id="seoTitle" label="عنوان سئو" hint="خالی بگذار تا از عنوان مقاله استفاده شود.">
              <input
                id="seoTitle"
                value={draft.seoTitle}
                onChange={(e) => set('seoTitle', e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField id="seoDescription" label="توضیح سئو" hint="خالی بگذار تا از خلاصه استفاده شود.">
              <textarea
                id="seoDescription"
                rows={3}
                value={draft.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
                className={`${textareaClass} min-h-24`}
              />
            </FormField>
            <FormField id="coverImage" label="تصویر کاور" hint="نشانی فایل، مثل /photos/cover.jpg">
              <input
                id="coverImage"
                dir="ltr"
                value={draft.coverImage}
                onChange={(e) => set('coverImage', e.target.value)}
                className={`latin ${inputClass}`}
              />
            </FormField>
          </div>
        </details>
      </aside>
    </form>
  )
}

/**
 * Preview renders Markdown structure only — headings, lists, emphasis, quotes.
 *
 * It does not compile MDX. Running the real compiler in the browser would mean
 * shipping it to every editor session, and a preview that throws on a half-typed
 * component is worse than one that shows the shape. The published page is the
 * real render.
 */
function Preview({ body }: { body: string }) {
  const blocks = body.replace(/<!--[\s\S]*?-->/g, '').split(/\n{2,}/)

  return (
    <div className="prose min-h-[32rem] rounded-md border border-border bg-bg p-6">
      {blocks.map((block, i) => {
        const text = block.trim()
        if (!text) return null
        if (text.startsWith('## ')) return <h2 key={i}>{inline(text.slice(3))}</h2>
        if (text.startsWith('### ')) return <h3 key={i}>{inline(text.slice(4))}</h3>
        if (text.startsWith('> ')) {
          return (
            <blockquote key={i} className="gold-marker text-500 text-text">
              {inline(text.replace(/^> ?/gm, ''))}
            </blockquote>
          )
        }
        if (/^[-*] /.test(text)) {
          return (
            <ul key={i}>
              {text.split('\n').map((li, j) => (
                <li key={j}>{inline(li.replace(/^[-*] /, ''))}</li>
              ))}
            </ul>
          )
        }
        if (text.startsWith('<')) {
          return (
            <p key={i} className="text-200 text-text-subtle">
              [کامپوننت MDX — در صفحهٔ منتشرشده رندر می‌شود]
            </p>
          )
        }
        return <p key={i}>{inline(text)}</p>
      })}
    </div>
  )
}

/** Bold and inline code only; anything more belongs to the real renderer. */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return part
  })
}
