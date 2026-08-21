'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { deleteTopic, saveTopic } from '@/lib/admin/actions'

type Topic = {
  id: string
  slug: string
  name: string
  description: string | null
  count: number
}

export function TopicManager({ topics }: { topics: Topic[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Partial<Topic> | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    setFields({})
    const res = await saveTopic({
      id: editing.id,
      slug: editing.slug ?? '',
      name: editing.name ?? '',
      description: editing.description ?? '',
    })
    setBusy(false)
    setMessage({ ok: res.ok, text: res.message ?? '' })
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else if (res.fields) {
      setFields(res.fields)
    }
  }

  async function remove(id: string) {
    const res = await deleteTopic(id)
    setMessage({ ok: res.ok, text: res.message ?? '' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-bg">
        {topics.length === 0 ? (
          <p className="p-6 text-300 text-text-muted">هنوز موضوعی نساخته‌ای.</p>
        ) : (
          <ul>
            {topics.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-4 border-b border-border p-5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-400 font-medium text-text">{t.name}</p>
                  <p className="latin mt-1 text-200 text-text-subtle">{t.slug}</p>
                  {t.description && (
                    <p className="mt-2 text-200 leading-normal text-text-muted">{t.description}</p>
                  )}
                </div>
                <span className="text-200 text-text-subtle">
                  {t.count.toLocaleString('fa-IR', { useGrouping: false })} مقاله
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  className="text-200 underline underline-offset-4"
                >
                  ویرایش
                </button>
                {t.count === 0 && (
                  <button
                    type="button"
                    onClick={() => void remove(t.id)}
                    className="text-200 text-text-subtle underline underline-offset-4 hover:text-text"
                  >
                    حذف
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside>
        {editing ? (
          <form onSubmit={save} className="space-y-5 rounded-lg border border-border bg-bg p-5">
            <p className="text-400 font-medium text-text">
              {editing.id ? 'ویرایش موضوع' : 'موضوع جدید'}
            </p>

            <FormField id="t-name" label="نام" required error={fields.name}>
              <input
                id="t-name"
                value={editing.name ?? ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField
              id="t-slug"
              label="اسلاگ"
              required
              hint="در نشانی صفحه استفاده می‌شود: /topics/…"
              error={fields.slug}
            >
              <input
                id="t-slug"
                dir="ltr"
                value={editing.slug ?? ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className={`latin ${inputClass}`}
              />
            </FormField>

            <FormField id="t-desc" label="توضیح" error={fields.description}>
              <textarea
                id="t-desc"
                rows={3}
                value={editing.description ?? ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className={`${textareaClass} min-h-24`}
              />
            </FormField>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="h-11 flex-1 rounded-md bg-solid-bg text-300 font-medium text-solid-text disabled:opacity-60"
              >
                {busy ? 'در حال ذخیره…' : 'ذخیره'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 rounded-md border border-border px-5 text-300 text-text"
              >
                انصراف
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing({ name: '', slug: '', description: '' })}
            className="h-11 w-full rounded-md bg-solid-bg text-300 font-medium text-solid-text"
          >
            موضوع جدید
          </button>
        )}

        {message && (
          <p
            role="status"
            className={`mt-4 text-200 ${message.ok ? 'text-text-muted' : 'font-medium text-text'}`}
          >
            {!message.ok && <span aria-hidden className="me-1.5 text-accent">▲</span>}
            {message.text}
          </p>
        )}
      </aside>
    </div>
  )
}
