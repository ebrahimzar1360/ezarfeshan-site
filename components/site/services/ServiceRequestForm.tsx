'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FormField, Honeypot, inputClass, textareaClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { serviceRequestSchema } from '@/lib/validation'

export type ServiceFormCopy = {
  title: string
  serviceLabel: string
  nameLabel: string
  businessLabel: string
  phoneLabel: string
  phonePlaceholder: string
  emailLabel: string
  needLabel: string
  needPlaceholder: string
  privacy: string
  submit: string
  success: string
  networkError: string
  close: string
}

type FormIn = z.input<typeof serviceRequestSchema>
type FormOut = z.output<typeof serviceRequestSchema>
type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The request form inside the /services dialog. The service is fixed by the
 * card that opened it: shown read-only, sent as its slug. Validated here for
 * the message (the same zod schema as the server) and again on the server for
 * the protection — rate limit, honeypot, the slug against the CMS list.
 *
 * A failed request keeps everything typed; field errors the server returns are
 * put back on their fields.
 */
export function ServiceRequestForm({
  service,
  copy,
  onClose,
}: {
  service: { slug: string; title: string }
  copy: ServiceFormCopy
  onClose: () => void
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: { service: service.slug },
  })

  async function onSubmit(values: FormOut) {
    setStatus('sending')
    setServerError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.ok) {
        const fields: Record<string, string> = body?.error?.fields ?? {}
        for (const [name, message] of Object.entries(fields)) {
          if (name in values) setError(name as keyof FormIn, { message })
        }
        setServerError(body?.error?.message ?? copy.networkError)
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setServerError(copy.networkError)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="mt-6 rounded-xl bg-bg-sunken px-6 py-10 text-center">
        <span aria-hidden className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-forest text-500 text-paper">
          <Icon name="check" />
        </span>
        <p className="mx-auto max-w-[26rem] text-400 font-bold leading-prose text-text">{copy.success}</p>
        <Button type="button" variant="outline" className="mt-7" onClick={onClose}>
          {copy.close}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative -mx-6 mt-5 min-h-0 overflow-y-auto px-6 pb-1">
      <Honeypot register={register('website')} />
      <input type="hidden" {...register('service')} />

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-300 font-bold text-text">{copy.serviceLabel}</p>
          <p className="flex items-center gap-3 rounded-md border border-border bg-bg-sunken px-4 py-3 text-300 font-bold text-forest dark:text-text">
            <span aria-hidden className="h-5 w-1 shrink-0 rounded-full bg-gold" />
            {service.title}
          </p>
          {errors.service?.message && (
            <p role="alert" className="mt-2 text-200 text-text">
              <Icon name="alert" className="me-1" />
              {errors.service.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="sr-name" label={copy.nameLabel} required error={errors.name?.message}>
            <input
              id="sr-name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              className={inputClass}
              {...register('name')}
            />
          </FormField>
          <FormField id="sr-business" label={copy.businessLabel} error={errors.business?.message}>
            <input
              id="sr-business"
              autoComplete="organization"
              aria-invalid={errors.business ? true : undefined}
              className={inputClass}
              {...register('business')}
            />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="sr-phone" label={copy.phoneLabel} required error={errors.phone?.message}>
            <input
              id="sr-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder={copy.phonePlaceholder}
              aria-invalid={errors.phone ? true : undefined}
              className={`${inputClass} text-end`}
              {...register('phone')}
            />
          </FormField>
          <FormField id="sr-email" label={copy.emailLabel} required error={errors.email?.message}>
            <input
              id="sr-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              placeholder="name@example.com"
              aria-invalid={errors.email ? true : undefined}
              className={`${inputClass} latin text-end`}
              {...register('email')}
            />
          </FormField>
        </div>

        <FormField id="sr-need" label={copy.needLabel} required error={errors.need?.message}>
          <textarea
            id="sr-need"
            rows={4}
            placeholder={copy.needPlaceholder}
            aria-invalid={errors.need ? true : undefined}
            className={`${textareaClass} min-h-32`}
            {...register('need')}
          />
        </FormField>

        <p className="rounded-md bg-bg-sunken px-4 py-3 text-200 leading-normal text-text-muted">{copy.privacy}</p>

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
      </div>
    </form>
  )
}
