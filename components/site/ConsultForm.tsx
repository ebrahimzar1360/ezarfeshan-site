'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormField, Honeypot, inputClass, textareaClass } from '@/components/ui/FormField'
import { leadSchema, type LeadInput } from '@/lib/validation'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const TEAM_SIZES = ['1', '2-5', '6-20', '21-50', '50+'] as const
const BUDGETS = ['نمی‌دانم', 'تا ۵۰ میلیون', '۵۰ تا ۱۵۰ میلیون', 'بیش از ۱۵۰ میلیون'] as const

/**
 * Consultation request.
 *
 * The qualifying fields are optional on purpose. A required budget field filters
 * out people who genuinely do not know yet — which is most of them — and the
 * only field that really matters is the description of the problem. That one is
 * required and has a minimum length, because a two-word enquiry cannot be
 * answered usefully.
 */
export function ConsultForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({ resolver: zodResolver(leadSchema) })

  async function onSubmit(values: LeadInput) {
    setStatus('sending')
    setServerError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setServerError(body?.error?.message ?? 'ارسال نشد. دوباره تلاش کن.')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      // the form is not reset here: a network failure must not cost the text
      setServerError('ارسال نشد — ارتباط با سرور برقرار نشد. دوباره تلاش کن؛ نوشته‌ات حفظ شده.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-lg border border-border bg-bg-sunken px-6 py-8">
        <p className="text-500 font-bold text-text">درخواستت رسید</p>
        <p className="mt-3 text-300 leading-prose text-text-muted">
          توضیحی که نوشتی را می‌خوانم و خودم جواب می‌دهم — معمولاً ظرف چند روز کاری.
          یک ایمیل تأیید هم برایت فرستاده شد.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-7">
      <Honeypot register={register('website')} />

      <div className="grid gap-7 sm:grid-cols-2">
        <FormField id="name" label="نام" required error={errors.name?.message}>
          <input
            id="name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            className={inputClass}
            {...register('name')}
          />
        </FormField>

        <FormField id="email" label="ایمیل" required error={errors.email?.message}>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            className={`latin ${inputClass}`}
            {...register('email')}
          />
        </FormField>

        <FormField id="phone" label="تلفن" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            aria-invalid={errors.phone ? true : undefined}
            className={`latin ${inputClass}`}
            {...register('phone')}
          />
        </FormField>

        <FormField id="company" label="کسب‌وکار" error={errors.company?.message}>
          <input id="company" className={inputClass} {...register('company')} />
        </FormField>

        <FormField id="teamSize" label="اندازهٔ تیم" error={errors.teamSize?.message}>
          <select id="teamSize" className={inputClass} defaultValue="" {...register('teamSize')}>
            <option value="">انتخاب کن</option>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>
                {s === '1' ? 'فقط خودم' : `${s} نفر`}
              </option>
            ))}
          </select>
        </FormField>

        {/* No hint here on purpose: "نمی‌دانم" is already one of the options, so a
            line telling people they may pick it repeats itself — and the extra
            line pushed this select out of alignment with the one beside it. */}
        <FormField id="budgetRange" label="بودجه" error={errors.budgetRange?.message}>
          <select id="budgetRange" className={inputClass} defaultValue="" {...register('budgetRange')}>
            <option value="">انتخاب کن</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        id="challenge"
        label="چه مسئله‌ای داری"
        required
        hint="هرچه مشخص‌تر بنویسی، جواب دقیق‌تری می‌گیری. یک مثال از هفتهٔ گذشته کافی است."
        error={errors.challenge?.message}
      >
        <textarea
          id="challenge"
          rows={7}
          aria-invalid={errors.challenge ? true : undefined}
          className={textareaClass}
          {...register('challenge')}
        />
      </FormField>

      {serverError && (
        <p role="alert" className="text-300 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">
            ▲
          </span>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="h-13 rounded-md bg-solid-bg px-8 text-500 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
      >
        {status === 'sending' ? 'در حال ارسال…' : 'ارسال درخواست'}
      </button>
    </form>
  )
}
