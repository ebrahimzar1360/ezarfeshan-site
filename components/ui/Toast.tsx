'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Transient confirmations, for actions with no natural inline home.
 *
 * Not `sonner`: it is 6 kB, its swipe-to-dismiss translates on a hardcoded axis,
 * and — decisively — it puts `role="status"` on its viewport. See the rule below.
 *
 * Toasts are *additive*. Every inline `role="status"` / `role="alert"` message
 * the forms already render stays exactly where it is: the tests assert on them,
 * and a confirmation beside the control you just used beats a popup in the
 * corner. This is for "کپی شد" and for admin actions that navigate away, taking
 * their inline message with them.
 */

type Tone = 'plain' | 'problem'
type Toast = { id: number; message: string; tone: Tone }

type ToastApi = {
  /** Neutral confirmation. */
  show: (message: string) => void
  /** Something went wrong; gets the leading mark, not a colour. */
  problem: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** Long enough to read a short Persian sentence, short enough not to linger. */
const DISMISS_MS = 5000

/** Beyond three, the stack is noise and the oldest is gone before it is read. */
const MAX_VISIBLE = 3

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message: string, tone: Tone) => {
      const id = nextId.current++
      setToasts((cur) => [...cur, { id, message, tone }].slice(-MAX_VISIBLE))
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DISMISS_MS)
      )
    },
    [dismiss]
  )

  // Clear pending timers on unmount so a dismiss never fires into a dead tree.
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
      pending.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show: (message) => push(message, 'plain'),
      problem: (message) => push(message, 'problem'),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/*
        NO `role` here, and none on the toasts. This is not a style choice.

        e2e/admin.spec.ts and e2e/newsletter.spec.ts both call
        `page.getByRole('status')` unqualified, and Playwright's strict mode
        fails when two elements match. A viewport carrying role="status" — which
        is what shadcn and sonner ship — would match from the moment it mounts,
        empty or not, and break both suites on every page.

        `aria-live` alone is enough and is safe: role=status implies
        aria-live=polite, but the reverse does not hold, so this div has no
        implicit role. Confirmed against the existing `<div aria-live="polite">`
        in components/site/SearchBox.tsx, which has coexisted with those tests
        since before this overhaul.

        Rendered unconditionally because a live region has to exist in the DOM
        before content is inserted into it, or assistive tech misses the change.
      */}
      <div
        aria-live="polite"
        aria-atomic="false"
        // Opposite edge from ChatWidget (bottom-5 end-5) so the two never stack.
        className="pointer-events-none fixed bottom-5 start-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rise-in pointer-events-auto flex items-start gap-3 rounded-md border border-border bg-bg-raised px-4 py-3 shadow-(--shadow)"
          >
            {/* No green/red variants: the palette is five colours and has
                neither. A problem is marked the way FormField marks one. */}
            {toast.tone === 'problem' && <Icon name="alert" className="mt-0.5 text-400" />}
            <p className="flex-1 text-200 leading-normal text-text">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="بستن پیام"
              className="-me-1 rounded-sm p-1 text-text-subtle transition-colors duration-150 hover:text-text"
            >
              <Icon name="close" className="text-300" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
