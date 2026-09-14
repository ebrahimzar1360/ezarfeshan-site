'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { site } from '@/lib/site'

type Message = { role: 'user' | 'assistant'; content: string }

const GREETING: Message = {
  role: 'assistant',
  content: `سلام 👋 من دستیار سایت ${site.name}م. فقط دربارهٔ چیزهایی که روی همین سایت هست — کارها، مسیر حرفه‌ای، قیمت مشاوره، مقاله‌ها — جواب می‌دهم. چی می‌خوای بدونی؟`,
}

/**
 * Openers for a first-time visitor. These are the questions the site can
 * actually answer well — pricing and booking are on /consult, the career
 * figures are computed in lib/content/bio.ts — so a visitor who taps one gets
 * a grounded answer rather than a "that isn't on the site" on their first try.
 */
const STARTERS = [
  'هزینهٔ مشاوره چقدر است؟',
  'چطور جلسه بگیرم؟',
  'دقیقاً چه کمکی می‌کنی؟',
  'چه سابقه‌ای داری؟',
] as const

/** Only role+content travels to the server, and only the last few turns —
 * enough for the model to track the thread, not a full transcript archive. */
const HISTORY_TURNS = 6

/** leadSchema.challenge demands 30 characters; prefilling from the visitor's
 * own words usually clears it, and they can edit before sending. */
const MIN_CHALLENGE = 30

/**
 * Floating chat widget, mounted once in app/(site)/layout.tsx.
 *
 * Deliberately stateless across visits (no localStorage, no cookie): the
 * conversation lives in component state and is gone on refresh. Nothing here
 * is sensitive enough to justify persisting a stranger's chat history.
 *
 * The lead form posts to the same /api/leads endpoint as the /consult page, so
 * a request captured here lands in the same table, sends the same two mails and
 * appears in the same admin list. The assistant itself never records anything —
 * it only points at this form, because a model paraphrasing someone's phone
 * number into a database is a worse failure than one extra click.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [leadOpen, setLeadOpen] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', phone: '', challenge: '', website: '' })
  const [leadSending, setLeadSending] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadDone, setLeadDone] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, sending, leadOpen])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const next = [...messages, { role: 'user', content: trimmed } as Message]
    setMessages(next)
    setInput('')
    setError(null)
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
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

  /** Seeds the challenge field with what the visitor already typed, so they are
   * not asked to explain their problem a second time. */
  function openLead() {
    setLeadError(null)
    setLead((cur) => {
      if (cur.challenge.trim()) return cur
      const said = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n')
      return { ...cur, challenge: said }
    })
    setLeadOpen(true)
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault()
    if (leadSending) return

    if (lead.challenge.trim().length < MIN_CHALLENGE) {
      setLeadError('کمی بیشتر دربارهٔ مسئله‌ات بنویس — دست‌کم ۳۰ کاراکتر.')
      return
    }

    setLeadSending(true)
    setLeadError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          challenge: lead.challenge,
          website: lead.website,
        }),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setLeadError(body?.error?.message ?? 'ثبت نشد. دوباره تلاش کن یا از صفحهٔ /consult اقدام کن.')
        return
      }
      setLeadDone(true)
      setLeadOpen(false)
      setMessages((cur) => [
        ...cur,
        {
          role: 'assistant',
          content: `درخواستت ثبت شد ✅ یک ایمیل تأیید هم برایت فرستاده شد. ${site.name} خودش می‌خواند و ظرف ۴۸ ساعت کاری جواب می‌دهد.`,
        },
      ])
    } catch {
      setLeadError('ارتباط با سرور برقرار نشد. دوباره تلاش کن.')
    } finally {
      setLeadSending(false)
    }
  }

  const showStarters = messages.length === 1 && !sending && !leadOpen

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          id={panelId}
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
                className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-300 leading-normal whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ms-auto bg-solid-bg text-solid-text'
                    : 'me-auto bg-bg-sunken text-text'
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
                <span
                  aria-hidden
                  className="size-1.5 animate-bounce rounded-full bg-text-subtle motion-reduce:animate-none"
                />
                <span
                  aria-hidden
                  className="size-1.5 animate-bounce rounded-full bg-text-subtle [animation-delay:150ms] motion-reduce:animate-none"
                />
                <span
                  aria-hidden
                  className="size-1.5 animate-bounce rounded-full bg-text-subtle [animation-delay:300ms] motion-reduce:animate-none"
                />
              </div>
            )}

            {showStarters && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-border bg-bg px-3 py-1.5 text-200 text-text-muted transition-colors duration-150 hover:border-focus hover:text-text"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p role="alert" className="text-200 font-medium text-text">
                <span aria-hidden className="me-1.5 text-accent">▲</span>
                {error}
              </p>
            )}
          </div>

          {leadOpen ? (
            <form onSubmit={submitLead} className="space-y-2 border-t border-border p-3">
              <p className="text-200 text-text-subtle">
                پر کن تا مستقیم به دست {site.name} برسد — همان فرم صفحهٔ مشاوره.
              </p>

              <input
                type="text"
                required
                value={lead.name}
                onChange={(e) => setLead((c) => ({ ...c, name: e.target.value }))}
                placeholder="نام"
                aria-label="نام"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-300 text-text placeholder:text-text-subtle focus:border-focus"
              />
              <input
                type="email"
                required
                value={lead.email}
                onChange={(e) => setLead((c) => ({ ...c, email: e.target.value }))}
                placeholder="ایمیل"
                aria-label="ایمیل"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-300 text-text placeholder:text-text-subtle focus:border-focus"
              />
              <input
                type="tel"
                value={lead.phone}
                onChange={(e) => setLead((c) => ({ ...c, phone: e.target.value }))}
                placeholder="تلفن (اختیاری)"
                aria-label="تلفن"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-300 text-text placeholder:text-text-subtle focus:border-focus"
              />
              <textarea
                rows={3}
                required
                value={lead.challenge}
                onChange={(e) => setLead((c) => ({ ...c, challenge: e.target.value }))}
                placeholder="مسئله‌ات چیست؟"
                aria-label="مسئله‌ات چیست؟"
                className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2 text-300 text-text placeholder:text-text-subtle focus:border-focus"
              />

              {/* Honeypot — the same trick /api/leads already expects. Hidden from
                  people and from screen readers; only a bot fills it. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={lead.website}
                onChange={(e) => setLead((c) => ({ ...c, website: e.target.value }))}
                className="sr-only"
              />

              {leadError && (
                <p role="alert" className="text-200 font-medium text-text">
                  <span aria-hidden className="me-1.5 text-accent">▲</span>
                  {leadError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={leadSending}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-solid-bg px-4 text-300 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
                >
                  {leadSending ? 'در حال ثبت…' : 'ثبت درخواست'}
                </button>
                <button
                  type="button"
                  onClick={() => setLeadOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3 text-300 text-text-muted transition-colors duration-150 hover:text-text"
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void send(input)
                }}
                className="flex items-end gap-2 border-t border-border p-3 pb-2"
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
                      void send(input)
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

              {!leadDone && (
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={openLead}
                    className="w-full rounded-md border border-border px-3 py-2 text-200 text-text-muted transition-colors duration-150 hover:border-focus hover:text-text"
                  >
                    ثبت درخواست مشاوره
                  </button>
                </div>
              )}
            </>
          )}
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
