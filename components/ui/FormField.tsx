import type { ReactNode } from 'react'

/**
 * Field wrapper: label, control, hint, error.
 *
 * The error is wired with aria-describedby and aria-invalid so a screen reader
 * announces it on focus. Colour alone never carries the message — the text is
 * always present.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-300 font-medium text-text">
        {label}
        {required && (
          <span className="ms-1 text-text-subtle" aria-hidden>
            *
          </span>
        )}
        {!required && <span className="ms-2 text-200 text-text-subtle">(اختیاری)</span>}
      </label>

      {hint && (
        <p id={hintId} className="mb-2 text-200 text-text-subtle">
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-200 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">
            ▲
          </span>
          {error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'h-12 w-full rounded-md border border-border bg-bg-raised px-4 text-300 text-text ' +
  'placeholder:text-text-subtle transition-colors duration-150 ' +
  'hover:border-border-strong focus:border-focus ' +
  'aria-[invalid=true]:border-accent'

export const textareaClass =
  'min-h-40 w-full rounded-md border border-border bg-bg-raised p-4 text-300 leading-prose ' +
  'text-text placeholder:text-text-subtle transition-colors duration-150 ' +
  'hover:border-border-strong focus:border-focus ' +
  'aria-[invalid=true]:border-accent'

/**
 * Bot trap. Hidden from people and from assistive technology, but a real input
 * a script will fill. Used instead of a captcha: no third-party script, no
 * puzzle for the reader, nothing to fail at.
 */
export function Honeypot({ register }: { register?: Record<string, unknown> }) {
  return (
    // No -9999px offset: the box is already 1px, transparent and clipped, and an
    // off-viewport position makes it look like a layout overflow to any audit
    // that measures element rects. aria-hidden plus tabIndex -1 keep it away
    // from screen readers and the tab order.
    <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
      <label htmlFor="website">وب‌سایت</label>
      <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register} />
    </div>
  )
}
