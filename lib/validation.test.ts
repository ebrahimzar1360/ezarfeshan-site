import { describe, expect, it } from 'vitest'
import { downloadSchema, leadSchema, subscribeSchema } from './validation'

/**
 * These cover the rules that are easy to break silently and expensive when they
 * are: address normalisation, the honeypot staying permissive, and the minimum
 * that makes a consultation request answerable.
 */

describe('subscribeSchema', () => {
  it('lowercases and trims the address so one person cannot become two subscribers', () => {
    const parsed = subscribeSchema.parse({ email: '  Ebrahim@Example.COM ' })
    expect(parsed.email).toBe('ebrahim@example.com')
  })

  it('rejects an address with a Persian message', () => {
    const result = subscribeSchema.safeParse({ email: 'not-an-address' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/[؀-ۿ]/)
    }
  })

  it('accepts a filled honeypot instead of rejecting it', () => {
    // A 422 naming this field would tell a bot exactly which input to skip next
    // time. Validation passes and the route quietly returns success instead.
    const result = subscribeSchema.safeParse({
      email: 'a@b.com',
      website: 'http://spam.example',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an address long enough to be an attack rather than a typo', () => {
    const long = `${'a'.repeat(250)}@example.com`
    expect(subscribeSchema.safeParse({ email: long }).success).toBe(false)
  })
})

describe('leadSchema', () => {
  const valid = {
    name: 'ابراهیم',
    email: 'a@b.com',
    challenge: 'تیم پنج نفره داریم و هر تصمیم غیرمعمول به من ارجاع می‌شود و وقتی برای ساختن نمی‌ماند.',
  }

  it('accepts a complete enquiry', () => {
    expect(leadSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a challenge too short to answer usefully', () => {
    const result = leadSchema.safeParse({ ...valid, challenge: 'کمک' })
    expect(result.success).toBe(false)
  })

  it('treats an empty optional string as absent rather than invalid', () => {
    // the form posts "" for untouched optional inputs
    expect(leadSchema.safeParse({ ...valid, phone: '', company: '' }).success).toBe(true)
  })

  it('rejects letters in the phone number', () => {
    expect(leadSchema.safeParse({ ...valid, phone: '0912abcd' }).success).toBe(false)
  })

  it('accepts the punctuation people actually type in a phone number', () => {
    expect(leadSchema.safeParse({ ...valid, phone: '+98 (912) 345-6789' }).success).toBe(true)
  })

  it('reports every bad field at once, not just the first', () => {
    const result = leadSchema.safeParse({ name: 'ا', email: 'nope', challenge: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = new Set(result.error.issues.map((i) => i.path[0]))
      expect(fields).toEqual(new Set(['name', 'email', 'challenge']))
    }
  })
})

describe('downloadSchema', () => {
  it('normalises the address the same way as signup', () => {
    expect(downloadSchema.parse({ email: ' A@B.COM ' }).email).toBe('a@b.com')
  })
})
