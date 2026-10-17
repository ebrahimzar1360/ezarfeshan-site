'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { deleteMedia, updateMedia } from '@/lib/admin/cms-actions'
import { formatBytes, type MediaItem } from './types'

/**
 * The media library: upload (button or drop), search, a grid, and a detail
 * panel for alt text, caption, copying the address and deleting.
 *
 * In `onSelect` mode it is the picker used by every image field — choosing an
 * item hands it back instead of opening the details. The same component in
 * both places means the alt text an editor fixes in one is fixed everywhere.
 */
export function MediaBrowser({
  onSelect,
  imagesOnly = false,
}: {
  onSelect?: (item: MediaItem) => void
  imagesOnly?: boolean
}) {
  const toast = useToast()
  const [items, setItems] = useState<MediaItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [active, setActive] = useState<MediaItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(
    async (q: string, after: string | null) => {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (after) params.set('cursor', after)
      if (imagesOnly) params.set('kind', 'image')
      try {
        const res = await fetch(`/api/admin/media?${params}`, { cache: 'no-store' })
        const body = await res.json()
        if (!res.ok || !body.ok) throw new Error(body?.error?.message ?? 'خطا')
        setItems((prev) => (after ? [...prev, ...body.items] : body.items))
        setCursor(body.nextCursor)
        setError(null)
      } catch {
        setError('فهرست رسانه‌ها بارگذاری نشد.')
      } finally {
        setLoading(false)
      }
    },
    [imagesOnly]
  )

  useEffect(() => {
    const t = setTimeout(() => void load(query, null), query ? 250 : 0)
    return () => clearTimeout(t)
  }, [query, load])

  async function upload(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length) return
    setUploading((n) => n + list.length)
    for (const file of list) {
      const form = new FormData()
      form.set('file', file)
      try {
        const res = await fetch('/api/admin/media', { method: 'POST', body: form })
        const body = await res.json()
        if (!res.ok || !body.ok) {
          toast.problem(`${file.name}: ${body?.error?.message ?? 'بارگذاری نشد.'}`)
        } else {
          const media = body.media as MediaItem
          setItems((prev) => [media, ...prev.filter((m) => m.id !== media.id)])
          if (body.duplicate) toast.show(`«${file.name}» قبلاً در کتابخانه بود.`)
          // a fresh upload has no alt text yet — open it so the editor writes one
          if (!onSelect) setActive(media)
        }
      } catch {
        toast.problem(`${file.name}: ارتباط با سرور برقرار نشد.`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  return (
    <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-h-0 flex-col">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void upload(e.dataTransfer.files)
          }}
          className={`flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4 transition-colors duration-150 ${
            dragging ? 'border-accent bg-accent/8' : 'border-border-strong bg-bg-sunken'
          }`}
        >
          <Button type="button" variant="brand" onClick={() => fileRef.current?.click()} loading={uploading > 0}>
            بارگذاری فایل
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={imagesOnly ? 'image/jpeg,image/png,image/webp,image/gif,image/avif' : 'image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf'}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void upload(e.target.files)
              e.target.value = ''
            }}
          />
          <p className="text-200 text-text-subtle">
            یا فایل را اینجا رها کن. JPG، PNG، WebP، GIF، AVIF{imagesOnly ? '' : '، PDF'} — حداکثر ۱۰ مگابایت. تصویرها خودکار
            بهینه و به WebP تبدیل می‌شوند و اطلاعات مکان از آن‌ها پاک می‌شود.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="media-q" className="sr-only">
            جست‌وجو در رسانه‌ها
          </label>
          <input
            id="media-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجو در نام فایل یا متن جایگزین…"
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 text-300 font-medium text-text">
            <Icon name="alert" className="me-1.5" />
            {error}
          </p>
        )}

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {!loading && items.length === 0 ? (
            <p className="rounded-lg border border-border bg-bg p-6 text-300 text-text-muted">
              {query ? 'چیزی با این عبارت پیدا نشد.' : 'هنوز فایلی بارگذاری نشده. اولین تصویر را از دکمهٔ بالا بفرست.'}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => {
                const selected = active?.id === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => (onSelect ? onSelect(m) : setActive(m))}
                      aria-pressed={onSelect ? undefined : selected}
                      className={`group block w-full overflow-hidden rounded-md border bg-bg text-start transition-colors duration-150 ${
                        selected ? 'border-accent ring-2 ring-accent/40' : 'border-border hover:border-border-strong'
                      }`}
                    >
                      <span className="block aspect-square bg-bg-sunken">
                        {m.mimeType.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a library file
                          <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-cover" />
                        ) : (
                          <span className="latin grid size-full place-items-center text-500 font-bold text-text-subtle">PDF</span>
                        )}
                      </span>
                      <span className="block truncate px-2 py-1.5 text-200 text-text-muted">{m.originalName}</span>
                      {!m.alt && m.mimeType.startsWith('image/') && (
                        <span className="block px-2 pb-1.5 text-[0.7rem] font-medium text-text">
                          <Icon name="alert" className="me-1" />
                          بدون متن جایگزین
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {loading && (
            <p className="mt-4 flex items-center gap-2 text-200 text-text-subtle">
              <Spinner /> در حال بارگذاری…
            </p>
          )}
          {cursor && !loading && (
            <Button type="button" variant="outline" className="mt-4" onClick={() => void load(query, cursor)}>
              موارد بیشتر
            </Button>
          )}
        </div>
      </div>

      {!onSelect && (
        <aside>
          {active ? (
            <MediaDetails
              key={active.id}
              item={active}
              onSaved={(m) => {
                setItems((prev) => prev.map((x) => (x.id === m.id ? m : x)))
                setActive(m)
              }}
              onDeleted={(id) => {
                setItems((prev) => prev.filter((x) => x.id !== id))
                setActive(null)
              }}
            />
          ) : (
            <p className="rounded-lg border border-border bg-bg p-5 text-300 leading-normal text-text-muted">
              یک فایل را انتخاب کن تا متن جایگزین و توضیحش را ببینی یا ویرایش کنی.
            </p>
          )}
        </aside>
      )}
    </div>
  )
}

function MediaDetails({
  item,
  onSaved,
  onDeleted,
}: {
  item: MediaItem
  onSaved: (m: MediaItem) => void
  onDeleted: (id: string) => void
}) {
  const toast = useToast()
  const [alt, setAlt] = useState(item.alt)
  const [caption, setCaption] = useState(item.caption ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const isImage = item.mimeType.startsWith('image/')

  async function save() {
    setBusy(true)
    const res = await updateMedia({ id: item.id, alt, caption })
    setBusy(false)
    setMessage({ ok: res.ok, text: res.message ?? '' })
    if (res.ok) onSaved({ ...item, alt: alt.trim(), caption: caption.trim() || null })
  }

  async function remove() {
    if (!window.confirm(`«${item.originalName}» برای همیشه حذف شود؟`)) return
    const res = await deleteMedia(item.id)
    if (res.ok) {
      toast.show('فایل حذف شد.')
      onDeleted(item.id)
    } else setMessage({ ok: false, text: res.message })
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.show(`${label} کپی شد.`)
    } catch {
      toast.problem('کپی نشد؛ دستی انتخاب کن.')
    }
  }

  const absolute = typeof window === 'undefined' ? item.url : `${window.location.origin}${item.url}`
  const snippet = isImage
    ? `<Figure src="${item.url}" alt="${alt.replace(/"/g, "'")}"${item.width ? ` width={${item.width}} height={${item.height}}` : ''}${caption ? ` caption="${caption.replace(/"/g, "'")}"` : ''} />`
    : `[${item.originalName}](${item.url})`

  return (
    <div className="space-y-5 rounded-lg border border-border bg-bg p-5">
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview
        <img src={item.url} alt={item.alt} className="w-full rounded-md border border-border object-contain" />
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-200">
        <dt className="text-text-subtle">نام</dt>
        <dd className="truncate">{item.originalName}</dd>
        <dt className="text-text-subtle">حجم</dt>
        <dd>{formatBytes(item.size)}</dd>
        {item.width && (
          <>
            <dt className="text-text-subtle">ابعاد</dt>
            <dd className="latin" dir="ltr">
              {item.width}×{item.height}
            </dd>
          </>
        )}
      </dl>

      {isImage && (
        <FormField
          id="m-alt"
          label="متن جایگزین (alt)"
          hint="آنچه تصویر نشان می‌دهد، برای کسی که آن را نمی‌بیند. برای تصویر تزئینی خالی بگذار."
        >
          <textarea id="m-alt" rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} className={`${textareaClass} min-h-20`} />
        </FormField>
      )}
      <FormField id="m-cap" label="توضیح (کپشن)">
        <input id="m-cap" value={caption} onChange={(e) => setCaption(e.target.value)} className={inputClass} />
      </FormField>

      <Button type="button" onClick={() => void save()} loading={busy} className="w-full">
        ذخیره
      </Button>
      {message && (
        <p role="status" className={`text-200 ${message.ok ? 'text-text-muted' : 'font-medium text-text'}`}>
          {!message.ok && <Icon name="alert" className="me-1.5" />}
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-200">
        <button type="button" className="underline underline-offset-4" onClick={() => void copy(absolute, 'نشانی')}>
          کپی نشانی
        </button>
        <button type="button" className="underline underline-offset-4" onClick={() => void copy(snippet, 'کد درج در مقاله')}>
          کپی کد درج در مقاله
        </button>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          باز کردن ↗
        </a>
        <button type="button" className="text-text-subtle underline underline-offset-4 hover:text-text" onClick={() => void remove()}>
          حذف
        </button>
      </div>
    </div>
  )
}
