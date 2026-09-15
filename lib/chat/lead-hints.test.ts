import { describe, expect, it } from 'vitest'
import { extractLeadHints, toLatinDigits } from './lead-hints'

describe('toLatinDigits', () => {
  it('converts Persian and Arabic-Indic digits', () => {
    expect(toLatinDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
    expect(toLatinDigits('٠٩١٢')).toBe('0912')
  })

  it('leaves non-digits alone', () => {
    expect(toLatinDigits('تلفن: ۰۷۱-۵۲۳۴۸۸۸۳')).toBe('تلفن: 071-52348883')
  })
})

describe('extractLeadHints', () => {
  it('finds an email', () => {
    expect(extractLeadHints(['ایمیلم siavash@example.com است']).email).toBe(
      'siavash@example.com'
    )
  })

  it('finds a Persian-digit mobile number', () => {
    expect(extractLeadHints(['شماره‌ام ۰۹۱۲۳۴۵۶۷۸۹']).phone).toBe('09123456789')
  })

  it('strips separators from a landline', () => {
    expect(extractLeadHints(['۰۷۱-۵۲۳۴۸۸۸۳']).phone).toBe('07152348883')
  })

  it('finds a name from an explicit introduction', () => {
    expect(extractLeadHints(['سلام، من سیاوش هستم']).name).toBe('سیاوش')
    expect(extractLeadHints(['اسم من سیاوش است']).name).toBe('سیاوش')
  })

  it('does not mistake a statement of intent for a name', () => {
    // The failure this pattern was narrowed to avoid.
    expect(extractLeadHints(['من دنبال یک مشاور هستم']).name).toBeUndefined()
    expect(extractLeadHints(['من منتظر جواب هستم']).name).toBeUndefined()
  })

  it('returns nothing for a message with no contact details', () => {
    expect(extractLeadHints(['هزینهٔ مشاوره چقدر است؟'])).toEqual({})
  })

  it('lets a later correction win', () => {
    const hints = extractLeadHints([
      'ایمیلم a@example.com',
      'ببخشید اشتباه شد، b@example.com درست است',
    ])
    expect(hints.email).toBe('b@example.com')
  })

  it('pulls all three out of one message', () => {
    const hints = extractLeadHints([
      'سلام، من سیاوش هستم. ایمیل: siavash@example.com و شماره ۰۹۱۲۳۴۵۶۷۸۹',
    ])
    expect(hints).toEqual({
      name: 'سیاوش',
      email: 'siavash@example.com',
      phone: '09123456789',
    })
  })
})
