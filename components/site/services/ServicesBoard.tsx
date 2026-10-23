'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Icon } from '@/components/ui/Icon'
import { fa } from '@/lib/content/bio'
import type { Service } from '@/lib/content/services'
import { ServiceRequestForm, type ServiceFormCopy } from './ServiceRequestForm'

export type ServiceLabels = { audience: string; problem: string; duration: string; price: string }

/**
 * The service cards and the one request dialog they share.
 *
 * Each card's button opens the dialog with its service fixed. The open service
 * is mirrored in the address (?service=slug), so a link from the homepage, a
 * message or an ad lands on the form already open, and closing it leaves a
 * clean /services. The cards render on the server as well — the copy is in the
 * HTML for search engines and for anyone before hydration.
 */
export function ServicesBoard({
  services,
  labels,
  form,
}: {
  services: readonly Service[]
  labels: ServiceLabels
  form: ServiceFormCopy
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const open = services.find((s) => s.slug === openSlug) ?? null

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('service')
    if (slug && services.some((s) => s.slug === slug)) setOpenSlug(slug)
  }, [services])

  const show = useCallback((slug: string) => {
    setOpenSlug(slug)
    const url = new URL(window.location.href)
    url.searchParams.set('service', slug)
    window.history.replaceState(null, '', url)
  }, [])

  const close = useCallback(() => {
    setOpenSlug(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('service')
    window.history.replaceState(null, '', url)
  }, [])

  return (
    <>
      <ol className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {services.map((s, i) => (
          <li
            key={s.slug}
            id={s.slug}
            data-reveal
            style={{ '--d': i % 2 } as CSSProperties}
            className="card-v3 flex scroll-mt-28 flex-col p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-800 font-black leading-none text-forest dark:text-emerald-300">
                {fa(i + 1).padStart(2, '۰')}
              </span>
              {s.kind && (
                <span className="rounded-md bg-forest/8 px-3 py-1.5 text-200 font-bold text-forest dark:bg-emerald-300/12 dark:text-emerald-300">
                  {s.kind}
                </span>
              )}
            </div>
            <span aria-hidden className="mt-5 block h-1 w-12 rounded-full bg-gold" />

            <h2 className="mt-5 text-600 font-bold leading-snug md:text-[1.7rem]">{s.title}</h2>

            <dl className="mt-6 space-y-4 text-300 leading-normal">
              {s.audience && (
                <div>
                  <dt className="flex items-center gap-2 text-200 font-bold text-text-subtle">
                    <Icon name="user" />
                    {labels.audience}
                  </dt>
                  <dd className="mt-1 text-text">{s.audience}</dd>
                </div>
              )}
              {s.problem && (
                <div>
                  <dt className="flex items-center gap-2 text-200 font-bold text-text-subtle">
                    <Icon name="alert" />
                    {labels.problem}
                  </dt>
                  <dd className="mt-1 text-text-muted">{s.problem}</dd>
                </div>
              )}
            </dl>

            {s.outputs.length > 0 && (
              <div className="mt-6 rounded-xl bg-bg-sunken p-5">
                <p className="text-200 font-bold text-text-subtle">{s.outputsLabel}</p>
                <ul className="mt-3 space-y-2.5">
                  {s.outputs.map((o) => (
                    <li key={o} className="flex gap-3 text-300 leading-normal text-text">
                      <span
                        aria-hidden
                        className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-forest text-[0.7rem] text-paper"
                      >
                        <Icon name="check" />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-300">
              {s.duration && (
                <div className="flex gap-2.5">
                  <dt className="flex shrink-0 items-center gap-1.5 text-text-subtle">
                    <Icon name="clock" />
                    {labels.duration}:
                  </dt>
                  <dd className="text-text">{s.duration}</dd>
                </div>
              )}
              {s.price && (
                <div className="flex gap-2.5">
                  <dt className="flex shrink-0 items-center gap-1.5 text-text-subtle">
                    <Icon name="tag" />
                    {labels.price}:
                  </dt>
                  <dd className="text-text">{s.price}</dd>
                </div>
              )}
            </dl>

            <div className="mt-auto pt-7">
              <Button
                type="button"
                variant="brand"
                size="lg"
                className="w-full"
                aria-haspopup="dialog"
                onClick={() => show(s.slug)}
              >
                {s.button}
                <Icon name="arrow" />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <Dialog open={open !== null} onClose={close} title={form.title} form>
        {open && <ServiceRequestForm key={open.slug} service={open} copy={form} onClose={close} />}
      </Dialog>
    </>
  )
}
