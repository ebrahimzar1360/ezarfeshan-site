'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { duplicateArticle, restoreRevision } from '@/lib/admin/actions'
import { formatDate } from '@/lib/format'

type Revision = { id: string; title: string; createdAt: string; by: string | null; words: number }

/**
 * Below the editor: who wrote it and when, a duplicate button, and the
 * revision history. Restoring is itself reversible — the text being replaced
 * becomes a revision first.
 */
export function ArticleTools({
  articleId,
  author,
  createdAt,
  updatedAt,
  revisions,
}: {
  articleId: string
  author: string | null
  createdAt: string
  updatedAt: string
  revisions: Revision[]
}) {
  const router = useRouter()
  const toast = useToast()
  const [pending, setPending] = useState<Revision | null>(null)
  const [busy, setBusy] = useState(false)

  const time = (iso: string) =>
    `${formatDate(new Date(iso))} · ${new Date(iso).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`

  async function restore() {
    if (!pending) return
    setBusy(true)
    const res = await restoreRevision(pending.id)
    setBusy(false)
    setPending(null)
    if (res.ok) {
      toast.show(res.message ?? '')
      // the editor holds its own copy of the text; a full reload picks up the restored one
      window.location.reload()
    } else toast.problem(res.message)
  }

  async function duplicate() {
    setBusy(true)
    const res = await duplicateArticle(articleId)
    setBusy(false)
    if (res.ok && res.id) {
      toast.show(res.message ?? '')
      router.push(`/admin/articles/${res.id}`)
    } else if (!res.ok) toast.problem(res.message)
  }

  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-border bg-bg p-5">
        <h2 className="text-400 font-bold">تاریخچهٔ نسخه‌ها</h2>
        <p className="mt-1 text-200 text-text-subtle">
          با هر ذخیرهٔ دستی، نسخهٔ قبلی اینجا نگه داشته می‌شود (تا ۵۰ نسخه). ذخیرهٔ خودکار نسخه نمی‌سازد.
        </p>
        {revisions.length === 0 ? (
          <p className="mt-4 text-300 text-text-muted">هنوز نسخهٔ قبلی‌ای ثبت نشده.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {revisions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-200">
                <span className="min-w-0 flex-1 truncate font-medium text-text">{r.title}</span>
                <span className="text-text-subtle">{time(r.createdAt)}</span>
                {r.by && <span className="text-text-subtle">{r.by}</span>}
                <span className="text-text-subtle">{r.words.toLocaleString('fa-IR')} واژه</span>
                <a href={`/admin/preview/revisions/${r.id}`} target="_blank" rel="noopener noreferrer">
                  دیدن
                </a>
                <button type="button" onClick={() => setPending(r)} className="underline underline-offset-4">
                  برگرداندن
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-bg p-5 text-200 text-text-muted">
        {author && <p>نویسنده: <span className="text-text">{author}</span></p>}
        <p>ساخته‌شده: {time(createdAt)}</p>
        <p>آخرین تغییر: {time(updatedAt)}</p>
        <Button type="button" variant="outline" onClick={() => void duplicate()} loading={busy} className="mt-2 w-full">
          ساخت رونوشت
        </Button>
      </div>

      <Dialog
        open={pending !== null}
        onClose={() => !busy && setPending(null)}
        title="برگرداندن نسخه"
        description="عنوان، خلاصه و متن این نسخه جای متن فعلی را می‌گیرند. متن فعلی به‌عنوان یک نسخه نگه داشته می‌شود. اگر مقاله منتشرشده است، تغییر بلافاصله روی سایت می‌رود."
        footer={
          <>
            <Button type="button" onClick={() => void restore()} loading={busy}>
              بله، برگردان
            </Button>
            <Button type="button" variant="outline" onClick={() => setPending(null)} disabled={busy}>
              انصراف
            </Button>
          </>
        }
      />
    </section>
  )
}
