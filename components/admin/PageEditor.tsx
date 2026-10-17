'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ImageInput, MediaPickerButton } from '@/components/admin/media/MediaPicker'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { deletePage, savePage } from '@/lib/admin/cms-actions'
import type { ActionResult } from '@/lib/admin/actions'

export type PageDraft = {
  id?: string
  slug: string
  title: string
  lead: string
  body: string
  status: 'DRAFT' | 'PUBLISHED'
  seoTitle: string
  seoDescription: string
  ogImage: string
  noindex: boolean
}

export const EMPTY_PAGE: PageDraft = {
  slug: '',
  title: '',
  lead: '',
  body: '',
  status: 'DRAFT',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  noindex: false,
}

/** Free-standing page: title, one-line lead, MDX body, SEO. Published at /<slug>. */
export function PageEditor({ initial }: { initial: PageDraft }) {
  const router = useRouter()
  const toast = useToast()
  const [d, setD] = useState<PageDraft>(initial)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const fields = result && !result.ok ? result.fields : undefined
  const set = <K extends keyof PageDraft>(k: K, v: PageDraft[K]) => setD((x) => ({ ...x, [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await savePage({
      ...d,
      lead: d.lead || undefined,
      seoTitle: d.seoTitle || undefined,
      seoDescription: d.seoDescription || undefined,
      ogImage: d.ogImage || undefined,
    })
    setBusy(false)
    setResult(res)
    if (res.ok && res.id && !d.id) {
      setD((x) => ({ ...x, id: res.id }))
      window.history.replaceState(null, '', `/admin/pages/${res.id}`)
    } else if (res.ok) router.refresh()
  }

  async function remove() {
    if (!d.id) return
    setBusy(true)
    const res = await deletePage(d.id)
    setBusy(false)
    if (res.ok) {
      toast.show(res.message ?? '')
      router.push('/admin/pages')
      router.refresh()
    } else toast.problem(res.message)
  }

  function insertAtCaret(text: string) {
    const el = bodyRef.current
    const at = el?.selectionStart ?? d.body.length
    set('body', `${d.body.slice(0, at)}\n\n${text}\n\n${d.body.slice(at)}`)
  }

  return (
    <form onSubmit={save} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormField id="p-title" label="عنوان" required error={fields?.title}>
          <input id="p-title" value={d.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
        </FormField>
        <FormField
          id="p-slug"
          label="نشانی"
          required
          hint="حروف کوچک لاتین، عدد و خط تیره. صفحه در /نشانی منتشر می‌شود. privacy یا terms جای صفحهٔ پیش‌فرض همان نشانی را می‌گیرد."
          error={fields?.slug}
        >
          <input id="p-slug" dir="ltr" value={d.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} className={`latin ${inputClass}`} />
        </FormField>
        <FormField id="p-lead" label="متن زیر عنوان" error={fields?.lead}>
          <textarea id="p-lead" rows={2} value={d.lead} onChange={(e) => set('lead', e.target.value)} className={`${textareaClass} min-h-20`} />
        </FormField>
        <FormField id="p-body" label="متن صفحه (MDX)" required error={fields?.body} hint="همان قالب مقاله‌ها: ## برای تیتر، **پررنگ**، [پیوند](/مسیر)، و کامپوننت‌هایی مثل <Callout>.">
          <div className="mb-2">
            <MediaPickerButton
              label="درج تصویر یا فایل"
              imagesOnly={false}
              onPick={(m) =>
                insertAtCaret(
                  m.mimeType.startsWith('image/')
                    ? `<Figure src="${m.url}" alt="${m.alt.replace(/"/g, "'")}"${m.width ? ` width={${m.width}} height={${m.height}}` : ''} />`
                    : `[${m.originalName}](${m.url})`
                )
              }
            />
          </div>
          <textarea
            ref={bodyRef}
            id="p-body"
            value={d.body}
            onChange={(e) => set('body', e.target.value)}
            spellCheck={false}
            className={`${textareaClass} min-h-[28rem] font-mono`}
          />
        </FormField>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-bg p-5">
          <FormField id="p-status" label="وضعیت" required>
            <select id="p-status" value={d.status} onChange={(e) => set('status', e.target.value as PageDraft['status'])} className={inputClass}>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="PUBLISHED">منتشرشده</option>
            </select>
          </FormField>
          <Button type="submit" loading={busy} className="mt-6 h-12 w-full">
            ذخیره
          </Button>
          {result && (
            <p role="status" className={`mt-3 text-200 ${result.ok ? 'text-text-muted' : 'font-medium text-text'}`}>
              {!result.ok && <Icon name="alert" className="me-1.5" />}
              {result.message}
            </p>
          )}
          {d.id && initial.status === 'PUBLISHED' && (
            <a href={`/${initial.slug}`} target="_blank" rel="noopener noreferrer" className="mt-4 block text-200 no-underline">
              دیدن روی سایت ↗
            </a>
          )}
          {d.id && (
            <button type="button" onClick={() => setConfirm(true)} className="mt-4 text-200 text-text-subtle underline underline-offset-4 hover:text-text">
              حذف صفحه
            </button>
          )}
        </div>

        <details className="rounded-lg border border-border bg-bg p-5">
          <summary className="cursor-pointer text-300 font-medium">سئو</summary>
          <div className="mt-5 space-y-5">
            <FormField id="p-st" label="عنوان سئو" hint={`${(d.seoTitle || d.title).length.toLocaleString('fa-IR')} / ۶۰`}>
              <input id="p-st" value={d.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} className={inputClass} />
            </FormField>
            <FormField id="p-sd" label="توضیح سئو" hint={`${(d.seoDescription || d.lead).length.toLocaleString('fa-IR')} / ۱۶۰`}>
              <textarea id="p-sd" rows={3} value={d.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} className={`${textareaClass} min-h-24`} />
            </FormField>
            <div>
              <p className="mb-2 text-300 font-medium">تصویر اشتراک‌گذاری</p>
              <ImageInput id="p-og" value={{ src: d.ogImage, alt: '' }} onChange={(v) => set('ogImage', v.src)} />
            </div>
            <label className="flex items-center gap-2.5 text-300">
              <input type="checkbox" checked={d.noindex} onChange={(e) => set('noindex', e.target.checked)} className="size-4" />
              در نتایج جست‌وجو نیاید (noindex)
            </label>
          </div>
        </details>
      </aside>

      <Dialog
        open={confirm}
        onClose={() => !busy && setConfirm(false)}
        title="حذف صفحه"
        description={`«${d.title}» برای همیشه حذف می‌شود و نشانی‌اش ۴۰۴ می‌دهد.`}
        footer={
          <>
            <Button type="button" onClick={() => void remove()} loading={busy}>
              بله، حذف کن
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirm(false)} disabled={busy}>
              انصراف
            </Button>
          </>
        }
      />
    </form>
  )
}
