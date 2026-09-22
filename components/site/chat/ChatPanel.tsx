'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { site } from '@/lib/site'

/**
 * The conversation panel.
 *
 * Deliberately **not** a native <dialog>, which is the answer everywhere else in
 * this codebase. `showModal()` makes the rest of the page inert, and this panel
 * is non-modal on purpose: you can keep reading the article while it is open,
 * which is most of the point of a site assistant. So Escape and focus return are
 * handled by hand here — the one place where the cheap answer is the wrong one.
 */
export function ChatPanel({
  id,
  onClose,
  returnFocusTo,
  children,
}: {
  id: string
  onClose: () => void
  /** Focus goes back here on close, so keyboard users are not dropped at the
   *  top of the document. */
  returnFocusTo: React.RefObject<HTMLElement | null>
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = ref.current
    if (!panel) return

    // Focus the first control inside, so the conversation is reachable by
    // keyboard the moment it opens.
    panel.querySelector<HTMLElement>('textarea, button, input')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
      returnFocusTo.current?.focus()
    }

    panel.addEventListener('keydown', onKeyDown)
    return () => panel.removeEventListener('keydown', onKeyDown)
  }, [onClose, returnFocusTo])

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={`گفت‌وگو با دستیار سایت ${site.name}`}
      className="flex h-[min(34rem,75dvh)] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-border bg-bg-raised shadow-(--shadow)"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-300 font-bold text-text">دستیار سایت</p>
          <p className="text-200 text-text-subtle">فقط بر اساس اطلاعات همین سایت</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose()
            returnFocusTo.current?.focus()
          }}
          aria-label="بستن گفت‌وگو"
          className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-bg-sunken hover:text-text"
        >
          <Icon name="close" />
        </button>
      </div>

      {children}
    </div>
  )
}
