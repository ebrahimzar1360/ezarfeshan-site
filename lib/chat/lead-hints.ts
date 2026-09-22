/**
 * Pulls name, email and phone out of what the visitor already typed into the
 * chat, so the lead form opens filled in rather than asking them to repeat
 * themselves.
 *
 * This is regex, not the model, and that is the whole point. Asking a language
 * model to "extract the phone number" invites it to normalise a digit, drop a
 * leading zero, or transliterate a name — and a lead with a subtly wrong phone
 * number is worse than no lead, because nobody finds out until the call fails.
 * A regex either matches the characters the visitor typed or it does not.
 *
 * Every field stays editable before submit, and nothing is stored until the
 * visitor presses the button themselves. The assistant still never claims to
 * have recorded anything — see rule ۷-الف in the system prompt.
 */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Persian and Arabic-Indic digits to ASCII, so one phone regex covers all
 * three ways a visitor's keyboard might produce the same number. */
export function toLatinDigits(text: string): string {
  return text.replace(/[۰-۹٠-٩]/g, (d) => {
    const fa = PERSIAN_DIGITS.indexOf(d)
    return String(fa >= 0 ? fa : ARABIC_DIGITS.indexOf(d))
  })
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

/** Iranian mobile and landline, with or without the +98/0098 country prefix.
 * Separators are common in what people type (۰۷۱-۵۲۳۴۸۸۸۳) so they are allowed
 * inside the match and stripped after. */
const PHONE = /(?:\+98|0098|0)[\s.-]?\d(?:[\s.-]?\d){8,9}/

/**
 * "من سیاوش هستم" / "اسم من سیاوش است" / "نام: سیاوش".
 *
 * Deliberately narrow — it only fires on an explicit self-introduction. A
 * looser pattern picks up "من دنبال یک مشاور هستم" and puts "دنبال یک مشاور"
 * in the name field, which reads as a bug to the visitor even though they can
 * fix it. No match is a better outcome than a wrong match here.
 */
/** A single name word: two or more non-separator characters that are not one
 * of the copulas that follow a name. Without the lookahead, "اسم من سیاوش است"
 * yields "سیاوش است" — the optional second word swallows the verb. */
const WORD = String.raw`(?!(?:است|هستم|هست|بود|می‌باشد)(?:$|[\s،.؛!?]))[^\s،.؛!?\n]{2,}`

const NAME = new RegExp(
  `(?:اسم|نام)\\s*(?:من|م)?\\s*[:،]?\\s*(${WORD}(?:\\s+${WORD})?)` +
    `|(?:^|[\\s،.])من\\s+(${WORD}(?:\\s+${WORD})?)\\s+هستم`
)

/** Words that mean the "من X هستم" branch matched a sentence about intent,
 * not an introduction. */
const NOT_A_NAME = /دنبال|به\s*دنبال|علاقه|مطمئن|منتظر|آماده|صاحب|مدیر|اینجا|راضی/

export type LeadHints = { name?: string; email?: string; phone?: string }

/** Scans the visitor's own messages, oldest first. Later mentions win, on the
 * assumption that a correction comes after the thing it corrects. */
export function extractLeadHints(userMessages: string[]): LeadHints {
  const hints: LeadHints = {}

  for (const raw of userMessages) {
    const message = raw.trim()
    if (!message) continue

    const email = message.match(EMAIL)
    if (email) hints.email = email[0]

    const phone = toLatinDigits(message).match(PHONE)
    if (phone) {
      const digits = phone[0].replace(/[\s.-]/g, '')
      // A bare 10-digit landline without the leading zero is indistinguishable
      // from a truncated mobile, so only keep what came in already dialable.
      if (digits.length >= 10) hints.phone = digits
    }

    const name = message.match(NAME)
    const candidate = (name?.[1] ?? name?.[2])?.trim()
    if (candidate && !NOT_A_NAME.test(candidate) && !EMAIL.test(candidate)) {
      hints.name = candidate
    }
  }

  return hints
}
