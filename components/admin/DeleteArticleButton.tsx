'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteArticle } from '@/lib/admin/actions'

/**
 * Two-step delete. The first click arms it, the second confirms — no modal, no
 * "type the title to confirm". Deleting an article is rare enough that a
 * second deliberate click is proportionate.
 */
export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    const res = await deleteArticle(id)
    if (res.ok) {
      router.push('/admin/articles')
      router.refresh()
    } else {
      setError(res.message)
      setBusy(false)
      setArmed(false)
    }
  }

  if (error) {
    return (
      <span role="alert" className="text-200 font-medium text-text">
        <span aria-hidden className="me-1.5 text-accent">▲</span>
        {error}
      </span>
    )
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-200 text-text-subtle underline underline-offset-4 hover:text-text"
      >
        حذف
      </button>
    )
  }

  return (
    <span className="flex items-center gap-3 text-200">
      <span className="text-text-muted">«{title}» حذف شود؟</span>
      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="font-medium text-text underline underline-offset-4 disabled:opacity-60"
      >
        {busy ? 'در حال حذف…' : 'بله، حذف کن'}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-text-subtle underline underline-offset-4"
      >
        انصراف
      </button>
    </span>
  )
}
