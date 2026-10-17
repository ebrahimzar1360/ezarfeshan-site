/**
 * Placeholders an editor can write in site copy, expanded at render time.
 *
 *   {{years:1380}}  → years since 1380, in Persian digits (۲۵)
 *   {{year}}        → the current Jalali year (۱۴۰۵)
 *
 * They exist for the same reason lib/content/bio.ts computes durations: a typed
 * "۲۵ سال" goes stale at the next Nowruz. Moving the copy into the database
 * must not bring that bug back.
 */
import { currentJalaliYear, fa, yearsSince } from '../content/bio'

export function expandTokens(text: string): string {
  return text
    .replace(/\{\{\s*years\s*:\s*(\d{3,4})\s*\}\}/g, (_, y: string) => fa(yearsSince(Number(y))))
    .replace(/\{\{\s*year\s*\}\}/g, () => fa(currentJalaliYear()))
}

export type InlinePart =
  | { kind: 'text'; text: string }
  | { kind: 'accent'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'break' }

/**
 * A deliberately small inline syntax for one-line copy:
 *
 *   *phrase*         accent (the brand colour for the ground it sits on)
 *   **phrase**       bold
 *   [label](/path)   link
 *   new line         line break
 *
 * Anything else is text. There is no HTML path at all, so copy from the
 * database cannot inject markup.
 */
export function parseInline(source: string): InlinePart[] {
  const text = expandTokens(source)
  const parts: InlinePart[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)|\r?\n/g
  let last = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push({ kind: 'text', text: text.slice(last, m.index) })
    if (m[1] !== undefined) parts.push({ kind: 'strong', text: m[1] })
    else if (m[2] !== undefined) parts.push({ kind: 'accent', text: m[2] })
    else if (m[3] !== undefined && m[4] !== undefined) parts.push({ kind: 'link', text: m[3], href: m[4] })
    else parts.push({ kind: 'break' })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) })
  return parts
}

/** Same copy as plain text — for <title>, meta descriptions, alt text and the chatbot. */
export function plainInline(source: string): string {
  return parseInline(source)
    .map((p) => (p.kind === 'break' ? ' ' : p.text))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}
