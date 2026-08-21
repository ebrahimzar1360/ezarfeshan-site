'use client'

import { useState } from 'react'
import { updateLead } from '@/lib/admin/actions'

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  teamSize: string | null
  budgetRange: string | null
  challenge: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED'
  note: string | null
  createdAt: string
}

const STATUSES = {
  NEW: 'جدید',
  CONTACTED: 'تماس گرفته شد',
  QUALIFIED: 'واجد شرایط',
  CLOSED: 'بسته‌شده',
} as const

export function LeadRow({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status)
  const [note, setNote] = useState(lead.note ?? '')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function save(nextStatus = status, nextNote = note) {
    setBusy(true)
    const res = await updateLead({ id: lead.id, status: nextStatus, note: nextNote })
    setBusy(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <details className="rounded-lg border border-border bg-bg" open={lead.status === 'NEW'}>
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-5">
        <span className="text-400 font-medium text-text">{lead.name}</span>
        <a href={`mailto:${lead.email}`} className="latin text-200" onClick={(e) => e.stopPropagation()}>
          {lead.email}
        </a>
        <span className={`text-200 ${status === 'NEW' ? 'text-accent' : 'text-text-subtle'}`}>
          {STATUSES[status]}
        </span>
        <time className="ms-auto text-200 text-text-subtle" dateTime={lead.createdAt}>
          {new Date(lead.createdAt).toLocaleDateString('fa-IR')}
        </time>
      </summary>

      <div className="border-t border-border p-5">
        <dl className="mb-5 grid gap-x-8 gap-y-2 text-200 sm:grid-cols-2">
          {lead.phone && (
            <div className="flex gap-2">
              <dt className="text-text-subtle">تلفن:</dt>
              <dd className="latin text-text">{lead.phone}</dd>
            </div>
          )}
          {lead.company && (
            <div className="flex gap-2">
              <dt className="text-text-subtle">کسب‌وکار:</dt>
              <dd className="text-text">{lead.company}</dd>
            </div>
          )}
          {lead.teamSize && (
            <div className="flex gap-2">
              <dt className="text-text-subtle">اندازهٔ تیم:</dt>
              <dd className="latin text-text">{lead.teamSize}</dd>
            </div>
          )}
          {lead.budgetRange && (
            <div className="flex gap-2">
              <dt className="text-text-subtle">بودجه:</dt>
              <dd className="text-text">{lead.budgetRange}</dd>
            </div>
          )}
        </dl>

        <p className="mb-5 whitespace-pre-wrap rounded-md bg-bg-sunken p-4 text-300 leading-prose text-text-muted">
          {lead.challenge}
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor={`s-${lead.id}`} className="mb-2 block text-200 text-text-subtle">
              وضعیت
            </label>
            <select
              id={`s-${lead.id}`}
              value={status}
              onChange={(e) => {
                const next = e.target.value as Lead['status']
                setStatus(next)
                void save(next, note)
              }}
              className="h-11 rounded-md border border-border bg-bg-raised px-3 text-300 text-text"
            >
              {Object.entries(STATUSES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-60 flex-1">
            <label htmlFor={`n-${lead.id}`} className="mb-2 block text-200 text-text-subtle">
              یادداشت
            </label>
            <input
              id={`n-${lead.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => void save()}
              className="h-11 w-full rounded-md border border-border bg-bg-raised px-3 text-300 text-text"
            />
          </div>

          <span className="text-200 text-text-subtle">
            {busy ? 'در حال ذخیره…' : saved ? 'ذخیره شد' : ''}
          </span>
        </div>
      </div>
    </details>
  )
}
