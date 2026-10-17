'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageInput, MediaPickerButton } from '@/components/admin/media/MediaPicker'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { saveArticle, type ActionResult } from '@/lib/admin/actions'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

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
  coverAlt: string
  ogImage: string
  canonicalUrl: string
  noindex: boolean
  seoTitle: string
  seoDescription: string
  topicIds: string[]
}

export const EMPTY_ARTICLE: ArticleDraft = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  status: 'DRAFT',
  publishedAt: '',
  featured: false,
  coverImage: '',
  coverAlt: '',
  ogImage: '',
  canonicalUrl: '',
  noindex: false,
  seoTitle: '',
  seoDescription: '',
  topicIds: [],
}

type Topic = { id: string; name: string }

const STATUS_LABELS = {
  DRAFT: 'پیش‌نویس',
  SCHEDULED: 'زمان‌بندی‌شده',
  PUBLISHED: 'منتشرشده',
} as const

/** Lowercase Latin, digits and single hyphens — what the slug rule accepts. */
function tidySlug(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

/** ISO instant → YYYY-MM-DDTHH:mm in the browser's zone, for datetime-local. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const quoteAttr = (v: string) => v.replace(/"/g, "'")

/** The MDX for a library file: a <Figure> for images, a plain link for documents. */
function mediaSnippet(m: {
  url: string
  alt: string
  caption: string | null
  width: number | null
  height: number | null
  mimeType: string
  originalName: string
}): string {
  if (!m.mimeType.startsWith('image/')) return `[${m.originalName}](${m.url})`
  const size = m.width && m.height ? ` width={${m.width}} height={${m.height}}` : ''
  const caption = m.caption ? ` caption="${quoteAttr(m.caption)}"` : ''
  return `<Figure src="${m.url}" alt="${quoteAttr(m.alt)}"${size}${caption} />`
}

/**
 * Article editor.
 *
 * Autosave only ever writes DRAFT articles. Saving a published post every few
 * seconds would push half-finished edits live, so a published article is only
 * written when the button is pressed — the status field is what decides, not a
 * separate toggle the user has to remember. Autosaves also skip the revision
 * snapshot; a deliberate save takes one, so every version that mattered can be
 * restored from the history beside the editor.
 */
export function ArticleEditor({
  initial,
  topics,
  canPublish = true,
  siteUrl = '',
}: {
  initial: ArticleDraft
  topics: Topic[]
  /** Authors save drafts only; the status menu offers nothing they cannot do. */
  canPublish?: boolean
  siteUrl?: string
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<ArticleDraft>(initial)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // compared against the live draft to decide whether anything needs saving
  const savedRef = useRef(JSON.stringify(initial))

  // The server hands publishedAt over as an ISO instant; datetime-local wants
  // the *editor's* wall-clock time, which only the browser knows. Converted
  // after mount so the server render and hydration agree.
  useEffect(() => {
    if (!initial.publishedAt || !initial.publishedAt.includes('Z')) return
    const local = toLocalInput(initial.publishedAt)
    setDraft((d) => ({ ...d, publishedAt: local }))
    savedRef.current = JSON.stringify({ ...JSON.parse(savedRef.current), publishedAt: local })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, for the initial value
  }, [])

  function set<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  /** Wrap the selection, or insert at the caret, and select what was inserted. */
  function insert(before: string, after = '', placeholder = '') {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b, value } = el
    const selected = value.slice(a, b) || placeholder
    set('body', value.slice(0, a) + before + selected + after + value.slice(b))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(a + before.length, a + before.length + selected.length)
    })
  }

  /** Block syntax goes on its own lines, with a blank line around it. */
  function insertBlock(text: string) {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: a, value } = el
    const pre = value.slice(0, a)
    const lead = pre.length === 0 || pre.endsWith('\n\n') ? '' : pre.endsWith('\n') ? '\n' : '\n\n'
    set('body', pre + lead + text + '\n\n' + value.slice(a))
    requestAnimationFrame(() => {
      el.focus()
      const pos = (pre + lead + text).length
      el.setSelectionRange(pos, pos)
    })
  }

  const save = useCallback(
    async (silent: boolean) => {
      if (!silent) setBusy(true)
      const payload = {
        ...draft,
        // datetime-local is wall-clock time; send it as an instant so the
        // server does not reinterpret it in its own (UTC) zone
        publishedAt: draft.publishedAt ? new Date(draft.publishedAt).toISOString() : undefined,
        coverImage: draft.coverImage || undefined,
        coverAlt: draft.coverAlt || undefined,
        ogImage: draft.ogImage || undefined,
        canonicalUrl: draft.canonicalUrl || undefined,
        seoTitle: draft.seoTitle || undefined,
        seoDescription: draft.seoDescription || undefined,
        autosave: silent,
      }
      const res = await saveArticle(payload)
      if (!silent) setBusy(false)

      if (res.ok) {
        if (silent) {
          savedRef.current = JSON.stringify(draft)
          setAutosavedAt(new Date().toLocaleTimeString('fa-IR'))
          if (!draft.id && res.id) {
            const saved = { ...draft, id: res.id }
            setDraft(saved)
            savedRef.current = JSON.stringify(saved)
            window.history.replaceState(null, '', `/admin/articles/${res.id}`)
          }
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

  // Ctrl/Cmd+S saves, as in every editor people already know.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const fields = result && !result.ok ? result.fields : undefined
  const words = draft.body.replace(/<!--[\s\S]*?-->/g, '').trim().split(/\s+/).filter(Boolean).length

  const toolbar: { label: string; run: () => void }[] = [
    { label: 'تیتر ۲', run: () => insertBlock('## تیتر بخش') },
    { label: 'تیتر ۳', run: () => insertBlock('### زیرتیتر') },
    { label: 'پررنگ', run: () => insert('**', '**', 'متن پررنگ') },
    { label: 'کج', run: () => insert('*', '*', 'متن کج') },
    { label: 'پیوند', run: () => insert('[', '](https://)', 'متن پیوند') },
    { label: 'فهرست', run: () => insertBlock('- مورد اول\n- مورد دوم') },
    { label: 'فهرست شماره‌دار', run: () => insertBlock('1. گام اول\n2. گام دوم') },
    { label: 'نقل‌قول', run: () => insertBlock('> جمله‌ای که باید دیده شود.') },
    { label: 'نکته', run: () => insertBlock('<Callout tone="note">\nمتن نکته\n</Callout>') },
    { label: 'جدول', run: () => insertBlock('| ستون ۱ | ستون ۲ |\n| --- | --- |\n| مقدار | مقدار |') },
  ]

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
            onBlur={(e) => set('slug', tidySlug(e.target.value))}
            className={`latin ${inputClass}`}
          />
        </FormField>

        <FormField
          id="excerpt"
          label="خلاصه"
          required
          hint={`در فهرست مقالات و نتایج گوگل دیده می‌شود. ${draft.excerpt.length.toLocaleString('fa-IR')} کاراکتر — ۱۲۰ تا ۱۶۰ بهترین است.`}
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
          {/* Left as plain buttons, and deliberately not given role="tab".
              The tab role is a promise of the whole widget pattern — a linked
              tabpanel, roving tabindex, arrow-key navigation — and announcing
              it without implementing it is worse than not claiming it at all.
              (It also silently changed the elements' role out from under
              `getByRole('button', { name: 'پیش‌نمایش' })`, which is how the
              regression surfaced.)

              `aria-pressed` is the complete and correct semantic for a
              two-state toggle: it says which view is showing, and everything it
              implies is actually true here. */}
          <div className="mb-2 flex items-center gap-1 border-b border-border">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
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
            <span className="ms-auto text-200 text-text-subtle">
              {words.toLocaleString('fa-IR')} واژه · MDX
            </span>
          </div>

          {tab === 'write' && (
            <div role="toolbar" aria-label="قالب‌بندی متن" className="mb-2 flex flex-wrap gap-1">
              {toolbar.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.run}
                  className="h-8 rounded border border-border bg-bg px-2.5 text-200 text-text-muted hover:border-border-strong hover:text-text"
                >
                  {b.label}
                </button>
              ))}
              <MediaPickerButton label="درج تصویر یا فایل" imagesOnly={false} onPick={(m) => insertBlock(mediaSnippet(m))} />
            </div>
          )}

          {tab === 'write' ? (
            <textarea
              ref={bodyRef}
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
              <Icon name="alert" className="me-1.5" />
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
              {Object.entries(STATUS_LABELS)
                .filter(([value]) => canPublish || value === 'DRAFT' || value === draft.status)
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </FormField>

          {!canPublish && (
            <p className="mt-3 text-200 leading-normal text-text-subtle">
              انتشار با ویراستار است؛ وقتی پیش‌نویس آماده شد خبرش کن.
            </p>
          )}

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

          {/* Label no longer swaps to "در حال ذخیره…" — that renamed the
              control mid-save, and e2e clicks it by the name `ذخیره`. */}
          <Button type="submit" loading={busy} className="mt-6 h-12 w-full">
            ذخیره
          </Button>

          {result && (
            <p
              role="status"
              className={`mt-3 text-200 ${result.ok ? 'text-text-muted' : 'font-medium text-text'}`}
            >
              {!result.ok && <Icon name="alert" className="me-1.5" />}
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
          {draft.id && (
            <a
              href={`/admin/preview/articles/${draft.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-200 no-underline"
            >
              پیش‌نمایش کامل آخرین نسخهٔ ذخیره‌شده ↗
            </a>
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

        <div className="rounded-lg border border-border bg-bg p-5">
          <p className="mb-3 text-300 font-medium text-text">تصویر کاور</p>
          <ImageInput
            id="cover"
            value={{ src: draft.coverImage, alt: draft.coverAlt }}
            onChange={(v) => setDraft((d) => ({ ...d, coverImage: v.src, coverAlt: v.alt }))}
            error={fields?.coverImage}
          />
          <p className="mt-3 text-200 text-text-subtle">بالای مقاله و در اشتراک‌گذاری دیده می‌شود. نسبت ۱۶:۹ بهترین است.</p>
        </div>

        <details
          className="rounded-lg border border-border bg-bg p-5"
          open={Boolean(fields?.seoTitle || fields?.canonicalUrl || fields?.ogImage)}
        >
          <summary className="cursor-pointer text-300 font-medium text-text">سئو و اشتراک‌گذاری</summary>
          <div className="mt-5 space-y-5">
            <SerpPreview
              title={draft.seoTitle || draft.title}
              description={draft.seoDescription || draft.excerpt}
              url={`${siteUrl}/articles/${draft.slug || '…'}`}
            />
            <FormField
              id="seoTitle"
              label="عنوان سئو"
              hint={`خالی بگذار تا از عنوان مقاله استفاده شود. ${(draft.seoTitle || draft.title).length.toLocaleString('fa-IR')} / ۶۰`}
              error={fields?.seoTitle}
            >
              <input
                id="seoTitle"
                value={draft.seoTitle}
                onChange={(e) => set('seoTitle', e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField
              id="seoDescription"
              label="توضیح سئو"
              hint={`خالی بگذار تا از خلاصه استفاده شود. ${(draft.seoDescription || draft.excerpt).length.toLocaleString('fa-IR')} / ۱۶۰`}
            >
              <textarea
                id="seoDescription"
                rows={3}
                value={draft.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
                className={`${textareaClass} min-h-24`}
              />
            </FormField>
            <div>
              <p className="mb-2 text-300 font-medium text-text">تصویر اشتراک‌گذاری (OG)</p>
              <ImageInput
                id="og"
                value={{ src: draft.ogImage, alt: '' }}
                onChange={(v) => set('ogImage', v.src)}
                error={fields?.ogImage}
              />
              <p className="mt-2 text-200 text-text-subtle">
                خالی بماند تا کاور، و اگر کاور نیست تصویر خودکار استفاده شود. ابعاد پیشنهادی ۱۲۰۰×۶۳۰.
              </p>
            </div>
            <FormField
              id="canonicalUrl"
              label="نشانی اصلی (canonical)"
              hint="فقط اگر این نوشته اول جای دیگری منتشر شده."
              error={fields?.canonicalUrl}
            >
              <input
                id="canonicalUrl"
                dir="ltr"
                placeholder="https://…"
                value={draft.canonicalUrl}
                onChange={(e) => set('canonicalUrl', e.target.value)}
                className={`latin ${inputClass}`}
              />
            </FormField>
            <label className="flex items-center gap-2.5 text-300 text-text">
              <input
                type="checkbox"
                checked={draft.noindex}
                onChange={(e) => set('noindex', e.target.checked)}
                className="size-4"
              />
              در نتایج موتورهای جست‌وجو نیاید (noindex)
            </label>
          </div>
        </details>
      </aside>
    </form>
  )
}

/** What the result looks like in a search engine — title cut near 60, text near 160. */
function SerpPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const cut = (v: string, n: number) => (v.length > n ? `${v.slice(0, n - 1)}…` : v)
  return (
    <div className="rounded-md border border-border bg-bg-sunken p-4">
      <p className="mb-2 text-200 text-text-subtle">پیش‌نمایش در نتایج جست‌وجو</p>
      <p className="latin truncate text-[0.75rem] text-text-subtle" dir="ltr">
        {url}
      </p>
      <p className="mt-1 text-400 font-medium text-link">{cut(title || 'عنوان مقاله', 60)}</p>
      <p className="mt-1 text-200 leading-normal text-text-muted">{cut(description || 'خلاصهٔ مقاله…', 160)}</p>
    </div>
  )
}

/**
 * Preview renders Markdown structure only — headings, lists, emphasis, quotes.
 *
 * It does not compile MDX. Running the real compiler in the browser would mean
 * shipping it to every editor session, and a preview that throws on a half-typed
 * component is worse than one that shows the shape. "پیش‌نمایش کامل" opens the
 * real render of the last saved version.
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
        if (/^\d+\. /.test(text)) {
          return (
            <ol key={i}>
              {text.split('\n').map((li, j) => (
                <li key={j}>{inline(li.replace(/^\d+\. /, ''))}</li>
              ))}
            </ol>
          )
        }
        const figure = /^<Figure\s+src="([^"]+)"\s+alt="([^"]*)"/.exec(text)
        if (figure) {
          return (
            // eslint-disable-next-line @next/next/no-img-element -- editor preview
            <img key={i} src={figure[1]} alt={figure[2]} className="rounded-md border border-border" />
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
