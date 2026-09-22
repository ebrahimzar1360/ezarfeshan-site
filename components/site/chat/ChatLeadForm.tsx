'use client'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { controlBaseClass } from '@/components/ui/FormField'
import { site } from '@/lib/site'
import type { Lead } from './types'

/**
 * The consultation request, inside the chat.
 *
 * Posts to the same /api/leads endpoint as the /consult page, so a request
 * captured here lands in the same table, sends the same two mails and appears in
 * the same admin list. The assistant itself never records anything — it only
 * points at this form, because a model paraphrasing someone's phone number into
 * a database is a worse failure than one extra click.
 *
 * Controls come from the shared primitives now. The previous version wrote its
 * own input classes, so a validation error here looked nothing like the same
 * error on /consult.
 */
/** Compact surfaces for the panel: bg-bg so a field reads against the
 *  bg-bg-raised panel behind it, and heights that fit a 34rem box. */
const field = `${controlBaseClass} h-10 bg-bg px-3 text-300`
const area = `${controlBaseClass} min-h-20 resize-none bg-bg px-3 py-2 text-300`

export function ChatLeadForm({
  lead,
  onChange,
  onSubmit,
  onCancel,
  sending,
  error,
}: {
  lead: Lead
  onChange: (next: (current: Lead) => Lead) => void
  onSubmit: (event: React.FormEvent) => void
  onCancel: () => void
  sending: boolean
  error: string | null
}) {
  const set = (key: keyof Lead) => (e: { target: { value: string } }) =>
    onChange((c) => ({ ...c, [key]: e.target.value }))

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-border p-3">
      <p className="text-200 text-text-subtle">
        پر کن تا مستقیم به دست {site.name} برسد — همان فرم صفحهٔ مشاوره.
      </p>

      <input
        type="text"
        required
        value={lead.name}
        onChange={set('name')}
        placeholder="نام"
        aria-label="نام"
        className={field}
      />
      <input
        type="email"
        required
        value={lead.email}
        onChange={set('email')}
        placeholder="ایمیل"
        aria-label="ایمیل"
        className={`latin ${field}`}
      />
      <input
        type="tel"
        value={lead.phone}
        onChange={set('phone')}
        placeholder="تلفن (اختیاری)"
        aria-label="تلفن"
        className={field}
      />
      <textarea
        rows={3}
        required
        value={lead.challenge}
        onChange={set('challenge')}
        placeholder="مسئله‌ات چیست؟"
        aria-label="مسئله‌ات چیست؟"
        className={area}
      />

      {/* Honeypot — the same trick /api/leads already expects. Hidden from
          people and from screen readers; only a bot fills it. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={lead.website}
        onChange={set('website')}
        className="sr-only"
      />

      {error && (
        <p role="alert" className="text-200 font-medium text-text">
          <Icon name="alert" className="me-1.5" />
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" loading={sending} className="h-10 flex-1 px-4">
          ثبت درخواست
        </Button>
        <Button variant="outline" onClick={onCancel} className="h-10 px-3">
          انصراف
        </Button>
      </div>
    </form>
  )
}
