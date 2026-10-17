'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { inputClass } from '@/components/ui/FormField'
import type { ImageValue } from '@/lib/cms/fields'
import { MediaBrowser } from './MediaBrowser'
import type { MediaItem } from './types'

/** Opens the library in a dialog and hands back the chosen item. */
export function MediaPickerButton({
  onPick,
  label = 'انتخاب از کتابخانه',
  imagesOnly = true,
}: {
  onPick: (item: MediaItem) => void
  label?: string
  imagesOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 rounded-md border border-border-strong px-4 text-200 font-medium text-text transition-colors duration-150 hover:border-accent"
      >
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="کتابخانهٔ رسانه" wide>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
          {open && (
            <MediaBrowser
              imagesOnly={imagesOnly}
              onSelect={(item) => {
                onPick(item)
                setOpen(false)
              }}
            />
          )}
        </div>
      </Dialog>
    </>
  )
}

/**
 * An image field: preview, pick or replace from the library, remove, and the
 * alt text — which is stored with the field, so the same picture can be
 * described differently where it means something different.
 */
export function ImageInput({
  id,
  value,
  onChange,
  error,
}: {
  id: string
  value: ImageValue
  onChange: (v: ImageValue) => void
  error?: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {value.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of a chosen image
          <img src={value.src} alt="" className="size-20 rounded-md border border-border object-cover" />
        ) : (
          <span className="grid size-20 place-items-center rounded-md border border-dashed border-border-strong text-200 text-text-subtle">
            بدون تصویر
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <MediaPickerButton
            label={value.src ? 'تعویض تصویر' : 'انتخاب تصویر'}
            onPick={(m) =>
              onChange({ src: m.url, alt: value.alt || m.alt, ...(m.width && m.height ? { width: m.width, height: m.height } : {}) })
            }
          />
          {value.src && (
            <button
              type="button"
              onClick={() => onChange({ src: '', alt: '' })}
              className="h-10 px-3 text-200 text-text-subtle underline underline-offset-4 hover:text-text"
            >
              برداشتن
            </button>
          )}
        </div>
      </div>
      {value.src && (
        <div>
          <label htmlFor={`${id}-alt`} className="mb-1.5 block text-200 font-medium text-text">
            متن جایگزین (alt)
          </label>
          <input
            id={`${id}-alt`}
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="تصویر چه نشان می‌دهد؟"
            className={inputClass}
          />
          {!value.alt && <p className="mt-1.5 text-200 text-text-subtle">خالی یعنی تصویر تزئینی است و صفحه‌خوان آن را رد می‌کند.</p>}
        </div>
      )}
      {error && (
        <p role="alert" className="text-200 font-medium text-text">
          {error}
        </p>
      )}
    </div>
  )
}
