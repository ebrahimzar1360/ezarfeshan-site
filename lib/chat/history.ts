export type ChatTurn = { role: 'user' | 'assistant'; content: string }

/**
 * What the visitor tells the assistant about themselves, they tell it once —
 * in the first or second thing they say. "سلام، من سیاوش هستم" is turn one and
 * is never repeated.
 *
 * The old window was a plain tail of six turns. Ask ten questions and turn one
 * has fallen off the end, so "اسم من چه بود؟" arrives with the answer already
 * deleted. The model then says, truthfully but uselessly, that the name never
 * came up. That is not a prompt-construction weakness — the name was never in
 * the request.
 *
 * So the window is head + tail, not tail. The opening turns are pinned because
 * that is where identity lands; the recent turns are kept because that is where
 * the current thread lives; the middle is what gets dropped, because a question
 * from five turns ago that was already answered is the least load-bearing part
 * of the transcript.
 */

/** Opening turns, always kept — where a visitor states name, business, problem. */
const HEAD_TURNS = 4

/** Ceiling on turns sent. Must stay <= chatSchema's `history` array max. */
const MAX_TURNS = 20

/**
 * Character budget for the whole window. Free-tier models have small context
 * windows and the site context already occupies most of it, so the transcript
 * has to be bounded by size and not just by count — twenty 2000-character
 * turns would push the site facts out of the prompt entirely.
 */
const MAX_CHARS = 6000

/** Per-turn cap. chatMessageSchema rejects anything over 2000. */
const MAX_TURN_CHARS = 1000

/** Stands in for the turns that were dropped, so the model reads a gap rather
 * than a contradiction — without it, head and tail splice into one apparently
 * continuous conversation that jumps topic for no reason. */
const ELISION: ChatTurn = {
  role: 'assistant',
  content: '(چند پیام میانی این گفت‌وگو برای کوتاه شدن حذف شده است.)',
}

function clampTurn(turn: ChatTurn): ChatTurn {
  const content = turn.content.trim()
  return content.length > MAX_TURN_CHARS
    ? { role: turn.role, content: `${content.slice(0, MAX_TURN_CHARS)}…` }
    : { role: turn.role, content }
}

function totalChars(turns: ChatTurn[]): number {
  return turns.reduce((sum, t) => sum + t.content.length, 0)
}

/**
 * Builds the history window sent with a message. Input is every prior turn in
 * the transcript, oldest first, excluding the message being sent.
 */
export function packHistory(turns: ChatTurn[]): ChatTurn[] {
  const clean = turns.map(clampTurn).filter((t) => t.content.length > 0)

  let packed: ChatTurn[]
  if (clean.length <= MAX_TURNS) {
    packed = clean
  } else {
    const head = clean.slice(0, HEAD_TURNS)
    // One slot of the budget goes to the elision marker itself.
    const tail = clean.slice(-(MAX_TURNS - HEAD_TURNS - 1))
    packed = [...head, ELISION, ...tail]
  }

  // Over budget: drop from just after the head, which is the oldest material
  // that is not identity. The head survives; the current thread survives.
  if (totalChars(packed) > MAX_CHARS) {
    const head = packed.slice(0, Math.min(HEAD_TURNS, packed.length))
    const rest = packed.slice(head.length).filter((t) => t.content !== ELISION.content)
    const kept: ChatTurn[] = []
    let budget = MAX_CHARS - totalChars(head) - ELISION.content.length

    for (let i = rest.length - 1; i >= 0; i--) {
      const turn = rest[i]
      if (!turn) continue
      if (budget - turn.content.length < 0) break
      budget -= turn.content.length
      kept.unshift(turn)
    }

    packed = kept.length < rest.length ? [...head, ELISION, ...kept] : [...head, ...kept]
  }

  return packed
}
