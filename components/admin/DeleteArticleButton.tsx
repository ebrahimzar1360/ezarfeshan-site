'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { deleteArticle } from '@/lib/admin/actions'

/**
 * Delete, behind a confirmation dialog.
 *
 * Was a two-step arm/confirm in place: the first click swapped the link for a
 * "«title» حذف شود؟ / بله، حذف کن / انصراف" row. That worked, but a destructive
 * action deserves something that takes focus and cannot be dismissed by a stray
 * click elsewhere — which is exactly what <dialog>.showModal() gives.
 *
 * Both button labels are load-bearing: e2e/admin.spec.ts clicks `حذف` (exact)
 * and then `بله، حذف کن`. They stay reachable by role, which is the only reason
 * moving the confirm into a dialog is safe at all.
 */
export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    const res = await deleteArticle(id)
    if (res.ok) {
      // Toast rather than an inline message: the navigation below unmounts the
      // control that would have carried the confirmation. ToastProvider sits in
      // the admin layout, above this page, so it survives the client-side push.
      toast.show(`«${title}» حذف شد.`)
      router.push('/admin/articles')
      router.refresh()
    } else {
      setError(res.message)
      setBusy(false)
      setOpen(false)
    }
  }

  if (error) {
    return (
      <span role="alert" className="text-200 font-medium text-text">
        <Icon name="alert" className="me-1.5" />
        {error}
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-200 text-text-subtle underline underline-offset-4 hover:text-text"
      >
        حذف
      </button>

      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="حذف مقاله"
        description={`«${title}» برای همیشه حذف می‌شود. این کار برگشت ندارد.`}
        footer={
          <>
            <Button onClick={confirm} loading={busy}>
              بله، حذف کن
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              انصراف
            </Button>
          </>
        }
      />
    </>
  )
}
