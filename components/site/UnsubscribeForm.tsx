'use client'

import { useState } from 'react'

type Status = 'idle' | 'sending' | 'done' | 'error'

export function UnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function unsubscribe() {
    setStatus('sending')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setMessage(body?.error?.message ?? 'لغو عضویت انجام نشد.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setMessage('ارتباط با سرور برقرار نشد. دوباره تلاش کن.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="mt-6 rounded-md border border-border bg-bg-sunken px-5 py-4">
        <p className="text-300 font-medium text-text">عضویتت لغو شد</p>
        <p className="mt-1.5 text-300 leading-normal text-text-muted">
          دیگر ایمیلی دریافت نمی‌کنی. اگر نظرت عوض شد، هر وقت خواستی دوباره ثبت‌نام کن.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="mt-5 text-400 leading-prose text-text-muted">
        با زدن این دکمه دیگر ایمیلی از خبرنامه دریافت نمی‌کنی.
      </p>
      <button
        type="button"
        onClick={unsubscribe}
        disabled={status === 'sending'}
        className="mt-7 h-12 rounded-md border border-border-strong px-6 text-300 font-medium text-text transition-colors duration-150 hover:border-accent disabled:opacity-60"
      >
        {status === 'sending' ? 'در حال لغو…' : 'لغو عضویت'}
      </button>
      {message && (
        <p role="alert" className="mt-4 text-200 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">▲</span>
          {message}
        </p>
      )}
    </>
  )
}
