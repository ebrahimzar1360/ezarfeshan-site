'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { site } from '@/lib/site'

type Message = { role: 'user' | 'assistant'; content: string }

const GREETING: Message = {
  role: 'assistant',
  content: `سلام 👋 من دستیار سایت ${site.name}م. فقط دربارهٔ چیزهایی که روی همین سایت هست — کارها، مسیر حرفه‌ای، قیمت مشاوره، مقاله‌ها — جواب می‌دهم. چی می‌خوای بدونی؟`,
}

/** Only role+content travels to the server, and only the last few turns —
 * enough for the model to track the thread, not a full transcript archive. */
const HISTORY_TURNS = 6

/**
 * Floating chat widget, mounted once in app/(site)/layout.tsx.
 *
 * Deliberately stateless across visits (no localStorage, no cookie): the
 * conversation lives in component state and is gone on refresh. Nothing here
 * is sensitive enough to justify persisting a stranger's chat history.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, sending])

  async function send() {
    const text = input.trim()
    if (!text || sending) return

    const next = [...messages, { role: 'user', content: text } as Message]
    setMessages(next)
    setInput('')
    setError(null)
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: next
            .slice(0, -1)
            .slice(-HISTORY_TURNS)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setError(body?.error?.message ?? 'ارسال نشد. دوباره تلاش کن.')
        return
      }
      setMessages((cur) => [...cur, { role: 'assistant', content: body.data.reply }])
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کن.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`گفت‌وگو با دستیار سایت ${site.name}`}
          className="flex h-[min(32rem,70dvh)] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-border bg-bg-raised shadow-(--shadow)"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-300 font-bold text-text">دستیار سایت</p>
              <p className="text-200 text-text-subtle">فقط بر اساس اطلاعات همین سایت</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن گفت‌وگو"
              className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-bg-sunken hover:text-text"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-300 leading-normal ${
                  m.role === 'user'
                    ? 'ms-auto bg-solid-bg text-solid-text'
                    : 'me-auto bg-bg-sunken text-text'
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="me-auto max-w-[85%] rounded-lg bg-bg-sunken px-3.5 py-2.5 text-300 text-text-subtle">
                در حال نوشتن…
              </div>
            )}
            {error && (
              <p role="alert" className="text-200 font-medium text-text">
                <span aria-hidden className="me-1.5 text-accent">▲</span>
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <label htmlFor={`${panelId}-input`} className="sr-only">
              پیامت را بنویس
            </label>
            <textarea
              id={`${panelId}-input`}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="سؤالت را بنویس…"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-border bg-bg px-3 py-2.5 text-300 text-text placeholder:text-text-subtle focus:border-focus"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="ارسال پیام"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-solid-bg px-4 text-300 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
            >
              ارسال
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'بستن گفت‌وگو' : 'باز کردن گفت‌وگو با دستیار سایت'}
        className="inline-flex size-14 items-center justify-center rounded-full bg-solid-bg text-solid-text shadow-(--shadow) transition-transform duration-150 hover:scale-105"
      >
        <span aria-hidden className="text-600">{open ? '✕' : '💬'}</span>
      </button>
    </div>
  )
}
