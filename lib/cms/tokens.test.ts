import { describe, expect, it } from 'vitest'
import { yearsSince, fa } from '../content/bio'
import { expandTokens, parseInline, plainInline } from './tokens'
import { isSafeHref, isSafeImageSrc } from './url'

describe('expandTokens', () => {
  it('computes years instead of storing them', () => {
    expect(expandTokens('{{years:1380}} سال')).toBe(`${fa(yearsSince(1380))} سال`)
  })
  it('leaves unknown braces alone', () => {
    expect(expandTokens('{{nope}}')).toBe('{{nope}}')
  })
})

describe('parseInline', () => {
  it('splits accent, bold, links and breaks', () => {
    expect(parseInline('a *b* **c** [d](/x)\ne')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'accent', text: 'b' },
      { kind: 'text', text: ' ' },
      { kind: 'strong', text: 'c' },
      { kind: 'text', text: ' ' },
      { kind: 'link', text: 'd', href: '/x' },
      { kind: 'break' },
      { kind: 'text', text: 'e' },
    ])
  })
  it('has no HTML path', () => {
    expect(parseInline('<b>x</b>')).toEqual([{ kind: 'text', text: '<b>x</b>' }])
  })
  it('flattens to plain text', () => {
    expect(plainInline('هم از *میدان* آمده')).toBe('هم از میدان آمده')
  })
})

describe('isSafeHref', () => {
  it.each(['/about', '#x', 'https://a.b/c', 'mailto:a@b.c', 'tel:+98 917'])('accepts %s', (h) => {
    expect(isSafeHref(h)).toBe(true)
  })
  it.each(['javascript:alert(1)', 'data:text/html,x', '//evil.com', 'about', ''])('rejects %s', (h) => {
    expect(isSafeHref(h)).toBe(false)
  })
  it('only takes our own image paths', () => {
    expect(isSafeImageSrc('/media/abc/a.webp')).toBe(true)
    expect(isSafeImageSrc('https://evil.com/a.png')).toBe(false)
    expect(isSafeImageSrc('//evil.com/a.png')).toBe(false)
  })
})
