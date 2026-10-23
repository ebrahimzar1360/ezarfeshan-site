import { describe, expect, it } from 'vitest'
import { downloadSchema, leadSchema, normalizeIranMobile, serviceRequestSchema, subscribeSchema } from './validation'

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

describe('normalizeIranMobile', () => {
  it.each([
    ['09123456789', '09123456789'],
    ['۰۹۱۲۳۴۵۶۷۸۹', '09123456789'],
    ['٠٩١٢٣٤٥٦٧٨٩', '09123456789'],
    ['۰۹۱۲ ۳۴۵ ۶۷۸۹', '09123456789'],
    ['0912-345-6789', '09123456789'],
    ['+98 912 345 6789', '09123456789'],
    ['00989123456789', '09123456789'],
    ['9123456789', '09123456789'],
  ])('accepts %s', (input, out) => {
    expect(normalizeIranMobile(input)).toBe(out)
  })

  it.each(['0212345678', '0912345678', '091234567890', '08123456789', 'abc', ''])('rejects %s', (input) => {
    expect(normalizeIranMobile(input)).toBeNull()
  })
})

describe('serviceRequestSchema', () => {
  const valid = {
    service: 'dealership-diagnosis',
    name: 'علی رضایی',
    business: '',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: 'Ali@Example.com',
    need: 'گزارش‌های واحد فروش هر ماه دیر و ناقص می‌رسد.',
  }

  it('normalises the phone and the email', () => {
    const r = serviceRequestSchema.parse(valid)
    expect(r.phone).toBe('09123456789')
    expect(r.email).toBe('ali@example.com')
  })

  it('requires name, phone, email and need', () => {
    const r = serviceRequestSchema.safeParse({ service: 'x' })
    expect(r.success).toBe(false)
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0])
    expect(paths).toEqual(expect.arrayContaining(['name', 'phone', 'email', 'need']))
  })

  it('refuses a landline and a service slug with odd characters', () => {
    expect(serviceRequestSchema.safeParse({ ...valid, phone: '02112345678' }).success).toBe(false)
    expect(serviceRequestSchema.safeParse({ ...valid, service: '../admin' }).success).toBe(false)
  })

  it('lets a filled honeypot through, for the route to drop quietly', () => {
    expect(serviceRequestSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(true)
  })
})
