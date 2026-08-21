'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Honeypot, inputClass } from '@/components/ui/FormField'
import { subscribeSchema, type SubscribeInput } from '@/lib/validation'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Inline newsletter signup.
 *
 * The success copy says an email is on the way rather than "you're subscribed",
 * because with double opt-in the subscription is not real until the link is
 * clicked. Telling someone they are subscribed when they are not is the kind of
 * small lie that costs a list its deliverability.
 */
export function NewsletterForm({
  source,
  tone = 'default',
}: {
  source: string
  tone?: 'default' | 'inverse'
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { source },
  })

  async function onSubmit(values: SubscribeInput) {
    setStatus('sending')
    setServerError(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setServerError(body?.error?.message ?? 'ارسال نشد. چند لحظه بعد دوباره تلاش کن.')
        setStatus('error')
        return
      }
      setStatus('sent')
      reset({ source })
    } catch {
      // network failure, not a server response — say so, and keep what they typed
      setServerError('ارتباط با سرور برقرار نشد. اتصالت را بررسی کن و دوباره بفرست.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className={`rounded-md border px-5 py-4 ${
          tone === 'inverse' ? 'border-border' : 'border-border bg-bg-sunken'
        }`}
      >
        <p className="text-300 font-medium text-text">ایمیل تأیید فرستاده شد</p>
        <p className="mt-1.5 text-300 leading-normal text-text-muted">
          صندوق ورودی‌ات را ببین و روی لینک تأیید کلیک کن. تا وقتی تأیید نکنی هیچ ایمیلی
          فرستاده نمی‌شود. اگر نرسید، پوشهٔ اسپم را هم نگاه کن.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative">
      <Honeypot register={register('website')} />
      <input type="hidden" {...register('source')} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`nl-${source}`} className="sr-only">
            نشانی ایمیل
          </label>
          <input
            id={`nl-${source}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `nl-${source}-error` : undefined}
            className={`latin ${inputClass}`}
            {...register('email')}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="h-12 shrink-0 rounded-md bg-solid-bg px-6 text-300 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
        >
          {status === 'sending' ? 'در حال ارسال…' : 'عضویت'}
        </button>
      </div>

      {errors.email && (
        <p id={`nl-${source}-error`} role="alert" className="mt-2 text-200 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">
            ▲
          </span>
          {errors.email.message}
        </p>
      )}

      {serverError && (
        <p role="alert" className="mt-2 text-200 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">
            ▲
          </span>
          {serverError}
        </p>
      )}

      <p className="mt-3 text-200 text-text-subtle">
        هر وقت خواستی لغو عضویت کن. نشانی‌ات جای دیگری نمی‌رود.
      </p>
    </form>
  )
}
