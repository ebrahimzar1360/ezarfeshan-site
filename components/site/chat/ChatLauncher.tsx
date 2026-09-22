'use client'

import type { RefObject } from 'react'
import { Icon } from '@/components/ui/Icon'

/**
 * The floating button.
 *
 * `rounded-full` is the one documented exception to the pill ban: a circular FAB
 * is the recognised convention for chat, and making this one a rectangle would
 * confuse people more than the inconsistency costs. tools/audit/classes.mjs
 * exempts this file by path.
 */
export function ChatLauncher({
  open,
  panelId,
  onToggle,
  buttonRef,
}: {
  open: boolean
  panelId: string
  onToggle: () => void
  /** Closing the panel returns focus here, so a keyboard user is not dropped at
   *  the top of the document. Has to be the button itself — a wrapping div is
   *  not focusable and .focus() on one silently does nothing. */
  buttonRef?: RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? 'بستن گفت‌وگو' : 'باز کردن گفت‌وگو با دستیار سایت'}
      className="inline-flex size-14 items-center justify-center rounded-full bg-solid-bg text-solid-text shadow-(--shadow) transition-transform duration-150 hover:scale-105"
    >
      <Icon name={open ? 'close' : 'chat'} className="text-600" />
    </button>
  )
}
