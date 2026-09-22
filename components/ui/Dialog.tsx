'use client'

import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Modal dialog over the native <dialog> element.
 *
 * Shares the mechanism with components/ui/Sheet.tsx — showModal() gives the
 * focus trap, Escape, the inert background and top-layer stacking for free —
 * but keeps its own component rather than adding a `variant` to Sheet: a sheet
 * fills an edge and a dialog is a centred box, and one component doing both
 * ends up with more props than either needs.
 *
 * Scroll lock and the ::backdrop come from the shared `body:has(dialog[open])`
 * and `.sheet::backdrop` rules in globals.css, so this inherits both.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    // Guarded both ways: showModal() on an open dialog throws, and close() on a
    // closed one fires a stray `close` event.
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // `cancel` is Escape. Prevent the default close so React state stays the one
    // source of truth — otherwise the dialog closes while `open` stays true and
    // the next toggle does nothing.
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose()
    }

    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('click', onClick)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('click', onClick)
    }
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="sheet m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0"
    >
      {open && (
        <div className="grid h-full place-items-center p-5">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(30rem,100%)] rounded-lg border border-border bg-bg-raised p-6 shadow-(--shadow)"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-500 font-bold text-text">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="-me-1 -mt-1 rounded-sm p-1 text-text-subtle transition-colors duration-150 hover:text-text"
              >
                <Icon name="close" className="text-400" />
              </button>
            </div>

            {description && (
              <p className="mt-3 text-300 leading-prose text-text-muted">{description}</p>
            )}
            {children}

            <div className="mt-7 flex flex-wrap gap-3">{footer}</div>
          </div>
        </div>
      )}
    </dialog>
  )
}
