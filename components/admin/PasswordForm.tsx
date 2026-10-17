'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, inputClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { changeOwnPassword } from '@/lib/admin/cms-actions'

export function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== repeat) {
      setMessage({ ok: false, text: 'تکرار گذرواژه یکی نیست.' })
      return
    }
    setBusy(true)
    const res = await changeOwnPassword({ current, next })
    setBusy(false)
    setMessage({ ok: res.ok, text: res.message ?? '' })
    if (res.ok) {
      setCurrent('')
      setNext('')
      setRepeat('')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5 rounded-lg border border-border bg-bg p-6">
      <FormField id="p-cur" label="گذرواژهٔ فعلی" required>
        <input id="p-cur" type="password" dir="ltr" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`latin ${inputClass}`} />
      </FormField>
      <FormField id="p-new" label="گذرواژهٔ تازه" required hint="دست‌کم ۱۲ کاراکتر. عبارتی بلند از چند واژه از رمز کوتاه پیچیده امن‌تر است.">
        <input id="p-new" type="password" dir="ltr" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={`latin ${inputClass}`} />
      </FormField>
      <FormField id="p-rep" label="تکرار گذرواژهٔ تازه" required>
        <input id="p-rep" type="password" dir="ltr" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={`latin ${inputClass}`} />
      </FormField>
      <Button type="submit" loading={busy}>
        تغییر گذرواژه
      </Button>
      {message && (
        <p role="status" className={`text-200 ${message.ok ? 'text-text-muted' : 'font-medium text-text'}`}>
          {!message.ok && <Icon name="alert" className="me-1.5" />}
          {message.text}
        </p>
      )}
    </form>
  )
}
