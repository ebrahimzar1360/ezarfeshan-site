import { describe, expect, it } from 'vitest'
import type { Field } from './fields'
import { mergeWithDefaults, validateValues } from './normalize'
import { SECTIONS } from './registry'

const fields: Field[] = [
  { type: 'text', name: 'title', label: 'عنوان', required: true, max: 10 },
  { type: 'link', name: 'cta', label: 'دکمه' },
  {
    type: 'list',
    name: 'items',
    label: 'موارد',
    itemLabel: 'مورد',
    max: 2,
    fields: [
      { type: 'text', name: 'label', label: 'متن', required: true },
      { type: 'url', name: 'href', label: 'مقصد', required: true },
    ],
  },
]
const defaults = { title: 'پیش‌فرض', cta: { label: 'برو', href: '/' }, items: [] }

describe('mergeWithDefaults', () => {
  it('falls back per field', () => {
    expect(mergeWithDefaults(fields, { title: 42, cta: { label: 'x', href: '/y' } }, defaults)).toEqual({
      title: 'پیش‌فرض',
      cta: { label: 'x', href: '/y' },
      items: [],
    })
  })
  it('survives garbage', () => {
    expect(mergeWithDefaults(fields, 'oops', defaults)).toEqual(defaults)
  })
  it('every registry default is self-consistent', () => {
    for (const s of Object.values(SECTIONS)) {
      const d = s.defaults as Record<string, unknown>
      expect(mergeWithDefaults(s.fields, d, d), s.key).toEqual(d)
    }
  })
})

describe('validateValues', () => {
  it('reports paths in Persian', () => {
    const r = validateValues(fields, {
      title: '',
      cta: { label: 'x', href: 'javascript:alert(1)' },
      items: [{ label: '', href: '/a' }, { label: 'b', href: '/b' }, { label: 'c', href: '/c' }],
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(Object.keys(r.errors).sort()).toEqual(['cta.href', 'items', 'items.0.label', 'title'])
  })
  it('trims and accepts valid input', () => {
    const r = validateValues(fields, { title: ' سلام ', cta: { label: 'برو', href: '/x' }, items: [] })
    expect(r).toEqual({ ok: true, values: { title: 'سلام', cta: { label: 'برو', href: '/x' }, items: [] } })
  })
  it('every registry default passes its own validation', () => {
    for (const s of Object.values(SECTIONS)) {
      const r = validateValues(s.fields, s.defaults)
      expect(r.ok ? 'ok' : JSON.stringify(r.errors), s.key).toBe('ok')
    }
  })
})
