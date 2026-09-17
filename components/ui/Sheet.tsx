'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Modal panel over the native <dialog> element.
 *
 * `showModal()` gives, for free and without a library: a focus trap the browser
 * enforces, Escape via the `cancel` event, an inert background, `::backdrop`, and
 * top-layer stacking that no z-index can defeat. That is the 80% of Radix Dialog
 * people install Radix for, at 16 kB gzip plus react-remove-scroll — see the
 * budget table in docs/UX-OVERHAUL.md §4.
 *
 * Scroll lock is the one thing <dialog> does not do. It is handled in CSS with
 * `body:has(dialog[open]) { overflow: hidden }` in globals.css, so no effect has
 * to remember to undo itself.
 *
 * Entrance is opacity plus a small vertical rise, never a horizontal slide. A
 * `translateX` keyframe moves in the physical +x direction whatever the writing
 * mode, so a panel written to arrive from the inline-start edge arrives from the
 * wrong side under dir="rtl" and nothing errors. See IMPORT-CHECKLIST step 7.
 */
export function Sheet({
  open,
  onClose,
  label,
  children,
  className = '',
}: {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog. */
  label: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // Guarded both ways: showModal() on an open dialog throws InvalidStateError,
    // and close() on a closed one fires a stray `close` event.
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // `cancel` is Escape. Prevent the default close so React state stays the
    // single source of truth — otherwise the dialog closes but `open` stays true
    // and the next toggle does nothing.
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    // A click landing on the dialog itself rather than its content is a click on
    // the backdrop: the padding-free dialog box covers the whole viewport.
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
      aria-label={label}
      className={cn(
        // the dialog box is the full viewport; the panel inside is what is styled
        'sheet m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0',
        className
      )}
    >
      {open && children}
    </dialog>
  )
}
