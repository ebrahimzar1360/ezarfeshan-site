'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ImageInput } from '@/components/admin/media/MediaPicker'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { resetContentSection, saveContentSection } from '@/lib/admin/cms-actions'
import type { Field, ImageValue, LinkValue, ListField, ScalarField, Values } from '@/lib/cms/fields'

/**
 * The form for one section of site copy, generated from its field list.
 *
 * Errors come back keyed by dotted path (`items.2.href`) and are shown on the
 * control they belong to; the save button also reports a count so a problem in
 * a collapsed list item is not missed.
 */
export function SectionEditor({
  sectionKey,
  fields,
  initial,
  defaults,
  edited,
  viewHref,
}: {
  sectionKey: string
  fields: readonly Field[]
  initial: Values
  defaults: Values
  edited: boolean
  viewHref?: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const savedRef = useRef(JSON.stringify(initial))
  const dirty = JSON.stringify(values) !== savedRef.current

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  async function save() {
    setBusy(true)
    setMessage(null)
    const res = await saveContentSection(sectionKey, values)
    setBusy(false)
    if (res.ok) {
      setErrors({})
      savedRef.current = JSON.stringify(values)
      setMessage({ ok: true, text: res.message ?? 'ذخیره شد.' })
      toast.show(res.message ?? 'ذخیره شد.')
      router.refresh()
    } else {
      setErrors(res.fields ?? {})
      const n = Object.keys(res.fields ?? {}).length
      setMessage({ ok: false, text: n ? `${res.message} (${n.toLocaleString('fa-IR')} مورد)` : res.message })
    }
  }

  async function reset() {
    setBusy(true)
    const res = await resetContentSection(sectionKey)
    setBusy(false)
    setConfirmReset(false)
    if (res.ok) {
      setValues(defaults)
      savedRef.current = JSON.stringify(defaults)
      setErrors({})
      toast.show(res.message ?? '')
      router.refresh()
    } else toast.problem(res.message)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className="grid gap-8 lg:grid-cols-[1fr_280px]"
    >
      <div className="min-w-0 space-y-6 rounded-lg border border-border bg-bg p-5 md:p-7">
        {fields.map((f) =>
          f.type === 'list' ? (
            <ListEditor
              key={f.name}
              field={f}
              items={(values[f.name] as Values[]) ?? []}
              errors={errors}
              onChange={(items) => setValues((v) => ({ ...v, [f.name]: items }))}
            />
          ) : (
            <ScalarInput
              key={f.name}
              field={f}
              id={`f-${f.name}`}
              path={f.name}
              value={values[f.name]}
              errors={errors}
              onChange={(val) => setValues((v) => ({ ...v, [f.name]: val }))}
            />
          )
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-border bg-bg p-5">
          <p className="text-200 text-text-subtle">
            {dirty ? 'تغییرات ذخیره‌نشده داری.' : edited ? 'این بخش ویرایش شده است.' : 'این بخش متن پیش‌فرض سایت را نشان می‌دهد.'}
          </p>
          <Button type="submit" loading={busy} disabled={!dirty && !Object.keys(errors).length} className="mt-4 h-12 w-full">
            ذخیره و انتشار
          </Button>
          {message && (
            <p role="status" className={`mt-3 text-200 ${message.ok ? 'text-text-muted' : 'font-medium text-text'}`}>
              {!message.ok && <Icon name="alert" className="me-1.5" />}
              {message.text}
            </p>
          )}
          {dirty && (
            <button
              type="button"
              onClick={() => setValues(JSON.parse(savedRef.current) as Values)}
              className="mt-3 text-200 text-text-subtle underline underline-offset-4 hover:text-text"
            >
              دور انداختن تغییرات
            </button>
          )}
        </div>
        {viewHref && (
          <a href={viewHref} target="_blank" rel="noopener noreferrer" className="block text-200 no-underline">
            دیدن این بخش روی سایت ↗
          </a>
        )}
        {edited && (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-200 text-text-subtle underline underline-offset-4 hover:text-text"
          >
            برگرداندن به متن پیش‌فرض
          </button>
        )}
      </aside>

      <Dialog
        open={confirmReset}
        onClose={() => !busy && setConfirmReset(false)}
        title="برگرداندن به پیش‌فرض"
        description="متن این بخش به همان چیزی برمی‌گردد که سایت با آن ساخته شده. ویرایش‌های فعلی پاک می‌شوند."
        footer={
          <>
            <Button type="button" onClick={() => void reset()} loading={busy}>
              بله، برگردان
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirmReset(false)} disabled={busy}>
              انصراف
            </Button>
          </>
        }
      />
    </form>
  )
}

function ScalarInput({
  field,
  id,
  path,
  value,
  errors,
  onChange,
}: {
  field: ScalarField
  id: string
  path: string
  value: unknown
  errors: Record<string, string>
  onChange: (v: unknown) => void
}) {
  const error = errors[path]
  const required = 'required' in field ? Boolean(field.required) : false
  const invalid = error ? true : undefined

  switch (field.type) {
    case 'text':
      return (
        <FormField id={id} label={field.label} hint={field.hint} error={error} required={required}>
          <input
            id={id}
            dir={field.ltr ? 'ltr' : undefined}
            value={String(value ?? '')}
            maxLength={field.max}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
            className={`${field.ltr ? 'latin ' : ''}${inputClass}`}
          />
          <Counter value={String(value ?? '')} max={field.max} />
        </FormField>
      )
    case 'textarea':
      return (
        <FormField id={id} label={field.label} hint={field.hint} error={error} required={required}>
          <textarea
            id={id}
            rows={field.rows ?? 4}
            value={String(value ?? '')}
            maxLength={field.max}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
            className={`${textareaClass} min-h-24`}
          />
          <Counter value={String(value ?? '')} max={field.max} />
        </FormField>
      )
    case 'url':
      return (
        <FormField id={id} label={field.label} hint={field.hint ?? 'مثل /about یا https://…'} error={error} required={required}>
          <input
            id={id}
            dir="ltr"
            value={String(value ?? '')}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
            className={`latin ${inputClass}`}
          />
        </FormField>
      )
    case 'number':
      return (
        <FormField id={id} label={field.label} hint={field.hint} error={error} required>
          <input
            id={id}
            type="number"
            dir="ltr"
            min={field.min}
            max={field.max}
            value={Number.isFinite(value as number) ? String(value) : ''}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
            className={`latin ${inputClass} max-w-40`}
          />
        </FormField>
      )
    case 'boolean':
      return (
        <label className="flex items-center gap-2.5 text-300 text-text">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-4" />
          {field.label}
        </label>
      )
    case 'select':
      return (
        <FormField id={id} label={field.label} hint={field.hint} error={error} required>
          <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      )
    case 'link': {
      const v = (value ?? { label: '', href: '' }) as LinkValue
      return (
        <fieldset className="min-w-0 rounded-md border border-border p-4">
          <legend className="px-1.5 text-300 font-medium text-text">
            {field.label}
            {field.optional && <span className="ms-2 text-200 font-normal text-text-subtle">(متن خالی = پنهان)</span>}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-label`} label="متن" error={errors[`${path}.label`]} required={!field.optional}>
              <input
                id={`${id}-label`}
                value={v.label}
                aria-invalid={errors[`${path}.label`] ? true : undefined}
                onChange={(e) => onChange({ ...v, label: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField id={`${id}-href`} label="مقصد" error={errors[`${path}.href`]} required={!field.optional}>
              <input
                id={`${id}-href`}
                dir="ltr"
                placeholder="/contact"
                value={v.href}
                aria-invalid={errors[`${path}.href`] ? true : undefined}
                onChange={(e) => onChange({ ...v, href: e.target.value })}
                className={`latin ${inputClass}`}
              />
            </FormField>
          </div>
        </fieldset>
      )
    }
    case 'image':
      return (
        <div>
          <p className="mb-2 text-300 font-medium text-text">{field.label}</p>
          {field.hint && <p className="mb-2 text-200 text-text-subtle">{field.hint}</p>}
          <ImageInput
            id={id}
            value={(value ?? { src: '', alt: '' }) as ImageValue}
            onChange={onChange}
            error={errors[`${path}.src`] ?? errors[`${path}.alt`]}
          />
        </div>
      )
  }
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null
  const near = value.length > max * 0.9
  return (
    <p className={`mt-1 text-end text-[0.7rem] ${near ? 'font-medium text-text' : 'text-text-subtle'}`}>
      {value.length.toLocaleString('fa-IR')} / {max.toLocaleString('fa-IR')}
    </p>
  )
}

function emptyItem(field: ListField): Values {
  const row: Values = {}
  for (const f of field.fields) {
    row[f.name] =
      f.type === 'link'
        ? { label: '', href: '' }
        : f.type === 'image'
          ? { src: '', alt: '' }
          : f.type === 'boolean'
            ? false
            : f.type === 'number'
              ? (f.min ?? 0)
              : f.type === 'select'
                ? (f.options[0]?.value ?? '')
                : ''
  }
  return row
}

/** Title shown on a collapsed item: its title or label, else its first text value. */
function itemTitle(field: ListField, item: Values, i: number): string {
  for (const name of ['title', 'label']) {
    const v = item[name]
    if (typeof v === 'string' && v.trim()) return v
  }
  for (const f of field.fields) {
    const v = item[f.name]
    if ((f.type === 'text' || f.type === 'textarea') && typeof v === 'string' && v.trim()) return v
  }
  return `${field.itemLabel} ${(i + 1).toLocaleString('fa-IR')}`
}

function ListEditor({
  field,
  items,
  errors,
  onChange,
}: {
  field: ListField
  items: Values[]
  errors: Record<string, string>
  onChange: (items: Values[]) => void
}) {
  const [open, setOpen] = useState<number | null>(items.length <= 3 ? -1 : null)
  const full = field.max !== undefined && items.length >= field.max

  function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    onChange(next)
    if (open === i) setOpen(j)
  }

  return (
    // min-w-0: a fieldset's default min-width is min-content, which let a long
    // item title push the form 5px past a 390px screen
    <fieldset className="min-w-0">
      <legend className="mb-3 text-400 font-bold text-text">{field.label}</legend>
      {field.hint && <p className="mb-3 text-200 text-text-subtle">{field.hint}</p>}
      {errors[field.name] && (
        <p role="alert" className="mb-3 text-200 font-medium text-text">
          <Icon name="alert" className="me-1.5" />
          {errors[field.name]}
        </p>
      )}
      <ol className="space-y-3">
        {items.map((item, i) => {
          const expanded = open === -1 || open === i
          const hasError = Object.keys(errors).some((k) => k.startsWith(`${field.name}.${i}.`))
          return (
            <li key={i} className={`rounded-md border ${hasError ? 'border-accent' : 'border-border'} bg-bg-sunken`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-start text-300 font-medium text-text"
                >
                  <Icon name="chevronDown" className={`text-text-subtle transition-transform ${expanded ? '' : '-rotate-90'}`} />
                  <span className="truncate">{itemTitle(field, item, i)}</span>
                  {hasError && <Icon name="alert" className="text-text" />}
                </button>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="بالاتر" className="rounded p-1.5 text-text-subtle hover:text-text disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="پایین‌تر" className="rounded p-1.5 text-text-subtle hover:text-text disabled:opacity-30">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, k) => k !== i))}
                  aria-label={`حذف ${field.itemLabel}`}
                  className="rounded p-1.5 text-text-subtle hover:text-text"
                >
                  <Icon name="close" />
                </button>
              </div>
              {expanded && (
                <div className="space-y-5 border-t border-border bg-bg p-4">
                  {field.fields.map((f) => (
                    <ScalarInput
                      key={f.name}
                      field={f}
                      id={`f-${field.name}-${i}-${f.name}`}
                      path={`${field.name}.${i}.${f.name}`}
                      value={item[f.name]}
                      errors={errors}
                      onChange={(val) => onChange(items.map((row, k) => (k === i ? { ...row, [f.name]: val } : row)))}
                    />
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <button
        type="button"
        disabled={full}
        onClick={() => {
          onChange([...items, emptyItem(field)])
          setOpen(items.length)
        }}
        className="mt-3 h-10 rounded-md border border-dashed border-border-strong px-4 text-200 font-medium text-text hover:border-accent disabled:opacity-40"
      >
        + افزودن {field.itemLabel}
      </button>
    </fieldset>
  )
}
