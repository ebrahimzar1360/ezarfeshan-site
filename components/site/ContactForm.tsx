'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField, Honeypot, inputClass, textareaClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { CONTACT_SUBJECTS, contactSchema, type ContactInput } from '@/lib/validation'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The four-field message form: نام، راه ارتباطی، موضوع، پیام. Validated here for
 * the message and again on the server for the protection (rate limit, honeypot).
 * A failed request keeps what was typed.
 */
export type ContactFormCopy = {
  nameLabel: string
  namePlaceholder: string
  contactLabel: string
  contactPlaceholder: string
  subjectLabel: string
  subjectPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  submit: string
  successTitle: string
  successText: string
}

export function ContactForm({ copy }: { copy: ContactFormCopy }) {
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(values: ContactInput) {
    setStatus('sending')
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
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
      setServerError('ارسال نشد — ارتباط با سرور برقرار نشد. دوباره تلاش کن؛ نوشته‌ات حفظ شده.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-xl bg-bg-sunken px-6 py-10 text-center">
        <span aria-hidden className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-emerald text-500 text-paper">
          <Icon name="check" />
        </span>
        <p className="text-500 font-extrabold">{copy.successTitle}</p>
        <p className="mt-3 text-300 leading-prose text-text-muted">
          {copy.successText}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <Honeypot register={register('website')} />

      <FormField id="name" label={copy.nameLabel} required error={errors.name?.message}>
        <input
          id="name"
          autoComplete="name"
          placeholder={copy.namePlaceholder}
          aria-invalid={errors.name ? true : undefined}
          className={inputClass}
          {...register('name')}
        />
      </FormField>

      <FormField id="contact" label={copy.contactLabel} required error={errors.contact?.message}>
        <input
          id="contact"
          autoComplete="email"
          placeholder={copy.contactPlaceholder}
          aria-invalid={errors.contact ? true : undefined}
          className={inputClass}
          {...register('contact')}
        />
      </FormField>

      <FormField id="subject" label={copy.subjectLabel} required error={errors.subject?.message}>
        <select
          id="subject"
          defaultValue=""
          aria-invalid={errors.subject ? true : undefined}
          className={inputClass}
          {...register('subject')}
        >
          <option value="" disabled>
            {copy.subjectPlaceholder}
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="message" label={copy.messageLabel} required error={errors.message?.message}>
        <textarea
          id="message"
          rows={5}
          placeholder={copy.messagePlaceholder}
          aria-invalid={errors.message ? true : undefined}
          className={textareaClass}
          {...register('message')}
        />
      </FormField>

      {serverError && (
        <p role="alert" className="text-300 font-medium text-text">
          <Icon name="alert" className="me-1.5" />
          {serverError}
        </p>
      )}

      <Button type="submit" variant="brand" size="lg" loading={status === 'sending'} className="w-full">
        {copy.submit}
        <Icon name="arrow" />
      </Button>
    </form>
  )
}
