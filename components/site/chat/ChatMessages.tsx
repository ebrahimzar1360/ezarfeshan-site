'use client'

import type { RefObject } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { Message } from './types'

/**
 * Openers for a first-time visitor. These are the questions the site can
 * actually answer well — pricing and booking are on /consult, the career
 * figures are computed in lib/content/bio.ts — so a visitor who taps one gets
 * a grounded answer rather than a "that isn't on the site" on their first try.
 */
export const STARTERS = [
  'هزینهٔ مشاوره چقدر است؟',
  'چطور جلسه بگیرم؟',
  'دقیقاً چه کمکی می‌کنی؟',
  'چه سابقه‌ای داری؟',
] as const

export function ChatMessages({
  messages,
  sending,
  error,
  showStarters,
  onStarter,
  listRef,
}: {
  messages: Message[]
  sending: boolean
  error: string | null
  showStarters: boolean
  onStarter: (question: string) => void
  listRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={listRef}
      role="log"
      aria-live="polite"
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      {messages.map((m, i) => (
        <div
          key={i}
          // ms-auto / me-auto, not ml/mr: the visitor's own messages have to sit
          // on the inline-end side of an RTL column, and the physical
          // properties would put them on the wrong side.
          className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-300 leading-normal whitespace-pre-wrap ${
            m.role === 'user' ? 'ms-auto bg-solid-bg text-solid-text' : 'me-auto bg-bg-sunken text-text'
          }`}
        >
          {m.content}
        </div>
      ))}

      {sending && (
        <div
          className="me-auto flex w-fit items-center gap-1.5 rounded-lg bg-bg-sunken px-3.5 py-3"
          role="status"
        >
          <span className="sr-only">در حال نوشتن پاسخ…</span>
          {/* Three dots. rounded-full on a 6px dot is a circle, not a pill —
              the ban is about controls. */}
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              aria-hidden
              style={{ animationDelay: `${delay}ms` }}
              className="size-1.5 animate-bounce rounded-full bg-text-subtle motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {showStarters && (
        <div className="flex flex-wrap gap-2 pt-1">
          {STARTERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onStarter(q)}
              className="rounded-md border border-border bg-bg px-3 py-1.5 text-200 text-text-muted transition-colors duration-150 hover:border-focus hover:text-text"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-200 font-medium text-text">
          <Icon name="alert" className="me-1.5" />
          {error}
        </p>
      )}
    </div>
  )
}
