'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { packHistory, type ChatTurn } from '@/lib/chat/history'
import { extractLeadHints } from '@/lib/chat/lead-hints'
import { site } from '@/lib/site'
import { ChatComposer } from './ChatComposer'
import { ChatLauncher } from './ChatLauncher'
import { ChatLeadForm } from './ChatLeadForm'
import { ChatMessages } from './ChatMessages'
import { ChatPanel } from './ChatPanel'
import type { Lead, Message } from './types'

const GREETING: Message = {
  role: 'assistant',
  content: `سلام 👋 من دستیار سایت ${site.name}م. فقط دربارهٔ چیزهایی که روی همین سایت هست — کارها، مسیر حرفه‌ای، قیمت مشاوره، مقاله‌ها — جواب می‌دهم. چی می‌خوای بدونی؟`,
}

/** leadSchema.challenge demands 30 characters; prefilling from the visitor's
 * own words usually clears it, and they can edit before sending. */
const MIN_CHALLENGE = 30

const EMPTY_LEAD: Lead = { name: '', email: '', phone: '', challenge: '', website: '' }

/**
 * Floating chat widget, mounted once in app/(site)/layout.tsx.
 *
 * This file owns the state and the network calls; everything visual lives in the
 * siblings beside it. Before the split it was 414 lines that wrote their own
 * input and button classes, so a validation error inside the chat looked nothing
 * like the same error on /consult.
 *
 * Deliberately stateless across visits (no localStorage, no cookie): the
 * conversation lives in component state and is gone on refresh. Nothing here is
 * sensitive enough to justify persisting a stranger's chat history.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [leadOpen, setLeadOpen] = useState(false)
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD)
  const [leadSending, setLeadSending] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadDone, setLeadDone] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  /**
   * Nothing renders until React has hydrated.
   *
   * The launcher used to be server-rendered, so it was on screen and looking
   * clickable while its onClick handler did not exist yet — the first click
   * landed on markup and vanished, and the widget read as broken until you
   * clicked a second time. Reproduced on both localhost and production, so it
   * is a real race and not a slow connection.
   *
   * Returning null is the fix rather than a disabled button: a button that
   * looks identical whether or not it works is the same trap in a different
   * costume. The widget is `position: fixed`, so appearing a beat later shifts
   * no layout, and a visitor who never sees the bubble never clicks a dead one.
   *
   * Do not remove this while tidying. It fixes a bug that was reported, chased
   * and committed (519ed19), and it fails silently if it comes back.
   */
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

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
          // The greeting is ours, not the visitor's, and re-sending it every
          // turn spends head budget on text the model already has in its
          // system prompt.
          history: packHistory(
            next.slice(0, -1).filter((m) => m.content !== GREETING.content)
          ),
        }),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        setError(body?.error?.message ?? 'ارسال نشد. دوباره تلاش کن.')
        // 503 means the assistant is out for hours, not for a moment — the
        // daily model quota. Telling someone to go find a form while the form
        // sits one click away inside this very widget wastes the one visitor
        // who was already asking. Open it, pre-filled from what they typed.
        // `next`, not the `messages` closure: that still holds the array from
        // before this send, so the message the visitor just typed — the one
        // carrying their name and number — would not be in it.
        if (res.status === 503) openLead(next)
        return
      }
      setMessages((cur) => [...cur, { role: 'assistant', content: body.data.reply }])
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کن.')
    } finally {
      setSending(false)
    }
  }

  /**
   * Seeds the form from what the visitor already typed, so they are not asked
   * to repeat their name, their number, or their problem a second time.
   *
   * Only empty fields are filled — once they have edited something, their
   * version wins over anything extracted from the transcript.
   */
  function openLead(from: ChatTurn[] = messages) {
    setLeadError(null)
    const said = from.filter((m) => m.role === 'user').map((m) => m.content)
    const hints = extractLeadHints(said)

    setLead((cur) => ({
      ...cur,
      name: cur.name.trim() || hints.name || '',
      email: cur.email.trim() || hints.email || '',
      phone: cur.phone.trim() || hints.phone || '',
      challenge: cur.challenge.trim() || said.join('\n'),
    }))
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
        body: JSON.stringify(lead),
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

  // After every hook, so the hook order never changes between renders.
  if (!hydrated) return null

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <ChatPanel id={panelId} onClose={() => setOpen(false)} returnFocusTo={launcherRef}>
          <ChatMessages
            messages={messages}
            sending={sending}
            error={error}
            showStarters={showStarters}
            onStarter={(q) => void send(q)}
            listRef={listRef}
          />

          {leadOpen ? (
            <ChatLeadForm
              lead={lead}
              onChange={setLead}
              onSubmit={submitLead}
              onCancel={() => setLeadOpen(false)}
              sending={leadSending}
              error={leadError}
            />
          ) : (
            <ChatComposer
              inputId={`${panelId}-input`}
              value={input}
              onChange={setInput}
              onSend={(text) => void send(text)}
              sending={sending}
              // Wrapped, not passed by reference: onClick would hand the
              // MouseEvent to `from` and openLead would filter a DOM event.
              onOpenLead={() => openLead()}
              showLeadPrompt={!leadDone}
            />
          )}
        </ChatPanel>
      )}

      <ChatLauncher
        open={open}
        panelId={panelId}
        onToggle={() => setOpen((v) => !v)}
        buttonRef={launcherRef}
      />
    </div>
  )
}
