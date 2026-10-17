import {
  DEFAULT_MAX_TEXT,
  DEFAULT_MAX_TEXTAREA,
  type Field,
  type ImageValue,
  type LinkValue,
  type ScalarField,
  type Values,
} from './fields'
import { isSafeHref, isSafeImageSrc } from './url'

/**
 * Two directions, one set of rules.
 *
 * `mergeWithDefaults` runs on every read: whatever is stored is trusted only as
 * far as it matches the field's shape, and anything missing or malformed falls
 * back to the default from the registry. A broken row therefore degrades one
 * field to its default rather than taking the page down.
 *
 * `validateValues` runs on save and is strict: it reports every problem in
 * Persian, keyed by a dotted path the form can attach the message to.
 */

const str = (v: unknown): v is string => typeof v === 'string'

function emptyFor(field: ScalarField): unknown {
  switch (field.type) {
    case 'link':
      return { label: '', href: '' } satisfies LinkValue
    case 'image':
      return { src: '', alt: '' } satisfies ImageValue
    case 'number':
      return field.min ?? 0
    case 'boolean':
      return false
    case 'select':
      return field.options[0]?.value ?? ''
    default:
      return ''
  }
}

function readScalar(field: ScalarField, value: unknown, fallback: unknown): unknown {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'url':
      return str(value) ? value : fallback
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? value : fallback
    case 'boolean':
      return typeof value === 'boolean' ? value : fallback
    case 'select':
      return str(value) && field.options.some((o) => o.value === value) ? value : fallback
    case 'link': {
      if (value && typeof value === 'object') {
        const v = value as Partial<LinkValue>
        if (str(v.label) && str(v.href)) return { label: v.label, href: v.href }
      }
      return fallback
    }
    case 'image': {
      if (value && typeof value === 'object') {
        const v = value as Partial<ImageValue>
        if (str(v.src) && str(v.alt)) {
          const out: ImageValue = { src: v.src, alt: v.alt }
          if (typeof v.width === 'number' && v.width > 0) out.width = v.width
          if (typeof v.height === 'number' && v.height > 0) out.height = v.height
          return out
        }
      }
      return fallback
    }
  }
}

export function mergeWithDefaults(fields: readonly Field[], stored: unknown, defaults: Values): Values {
  const src = stored && typeof stored === 'object' && !Array.isArray(stored) ? (stored as Values) : {}
  const out: Values = {}
  for (const field of fields) {
    const fallback = defaults[field.name]
    const value = src[field.name]
    if (field.type === 'list') {
      if (!Array.isArray(value)) {
        out[field.name] = fallback ?? []
        continue
      }
      out[field.name] = value
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          const row: Values = {}
          for (const f of field.fields) row[f.name] = readScalar(f, (item as Values)[f.name], emptyFor(f))
          return row
        })
    } else {
      out[field.name] = readScalar(field, value, fallback ?? emptyFor(field))
    }
  }
  return out
}

export type ValidationResult =
  | { ok: true; values: Values }
  | { ok: false; errors: Record<string, string> }

function checkScalar(field: ScalarField, value: unknown, path: string, errors: Record<string, string>): unknown {
  switch (field.type) {
    case 'text':
    case 'textarea': {
      const v = str(value) ? value.trim() : ''
      const max = field.max ?? (field.type === 'text' ? DEFAULT_MAX_TEXT : DEFAULT_MAX_TEXTAREA)
      if (field.required && !v) errors[path] = `«${field.label}» نباید خالی باشد.`
      else if (v.length > max) errors[path] = `«${field.label}» حداکثر ${max} کاراکتر است.`
      return v
    }
    case 'url': {
      const v = str(value) ? value.trim() : ''
      if (!v) {
        if (field.required) errors[path] = `«${field.label}» نباید خالی باشد.`
      } else if (!isSafeHref(v)) {
        errors[path] = 'نشانی باید با / یا https:// یا mailto: یا tel: شروع شود.'
      }
      return v
    }
    case 'link': {
      const v = (value && typeof value === 'object' ? value : {}) as Partial<LinkValue>
      const label = str(v.label) ? v.label.trim() : ''
      const href = str(v.href) ? v.href.trim() : ''
      if (!label && !field.optional) errors[`${path}.label`] = 'متن دکمه را بنویس.'
      if (label && !href) errors[`${path}.href`] = 'مقصد دکمه را بنویس.'
      else if (href && !isSafeHref(href)) {
        errors[`${path}.href`] = 'نشانی باید با / یا https:// یا mailto: یا tel: شروع شود.'
      }
      if (label.length > DEFAULT_MAX_TEXT) errors[`${path}.label`] = 'متن دکمه خیلی بلند است.'
      return { label, href }
    }
    case 'image': {
      const v = (value && typeof value === 'object' ? value : {}) as Partial<ImageValue>
      const src = str(v.src) ? v.src.trim() : ''
      const alt = str(v.alt) ? v.alt.trim() : ''
      if (src && !isSafeImageSrc(src)) errors[`${path}.src`] = 'تصویر را از کتابخانهٔ رسانه انتخاب کن.'
      if (alt.length > 300) errors[`${path}.alt`] = 'متن جایگزین حداکثر ۳۰۰ کاراکتر است.'
      const out: ImageValue = { src, alt }
      if (typeof v.width === 'number' && v.width > 0) out.width = Math.round(v.width)
      if (typeof v.height === 'number' && v.height > 0) out.height = Math.round(v.height)
      return out
    }
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(n)) {
        errors[path] = `«${field.label}» باید عدد باشد.`
        return 0
      }
      if (field.min !== undefined && n < field.min) errors[path] = `«${field.label}» کمتر از حد مجاز است.`
      if (field.max !== undefined && n > field.max) errors[path] = `«${field.label}» بیشتر از حد مجاز است.`
      return n
    }
    case 'boolean':
      return value === true
    case 'select': {
      if (!str(value) || !field.options.some((o) => o.value === value)) {
        errors[path] = `گزینهٔ «${field.label}» معتبر نیست.`
        return field.options[0]?.value ?? ''
      }
      return value
    }
  }
}

export function validateValues(fields: readonly Field[], input: unknown): ValidationResult {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? (input as Values) : {}
  const errors: Record<string, string> = {}
  const values: Values = {}

  for (const field of fields) {
    const value = src[field.name]
    if (field.type === 'list') {
      const items = Array.isArray(value) ? value : []
      if (field.max !== undefined && items.length > field.max) {
        errors[field.name] = `حداکثر ${field.max} ${field.itemLabel}.`
      }
      values[field.name] = items.map((item, i) => {
        const row: Values = {}
        const obj = item && typeof item === 'object' ? (item as Values) : {}
        for (const f of field.fields) row[f.name] = checkScalar(f, obj[f.name], `${field.name}.${i}.${f.name}`, errors)
        return row
      })
    } else {
      values[field.name] = checkScalar(field, value, field.name, errors)
    }
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values }
}
