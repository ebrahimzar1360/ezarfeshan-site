'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, inputClass } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { saveUser } from '@/lib/admin/cms-actions'
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  permissionsOf,
  type Role,
} from '@/lib/admin/permissions'

type User = {
  id: string
  email: string
  name: string
  role: Role
  active: boolean
  lastLoginAt: string | null
  articles: number
}

type Draft = { id?: string; email: string; name: string; role: Role; active: boolean; password: string }

const ROLES: Role[] = ['ADMIN', 'EDITOR', 'AUTHOR']

/**
 * Accounts and roles. Roles are fixed (lib/admin/permissions.ts) and shown as
 * a matrix, so whoever hands out access sees exactly what each role opens.
 * A password typed here is set immediately; leave it empty to keep the old one.
 */
export function UserManager({ users, selfId }: { users: User[]; selfId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Draft | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    setFields({})
    const res = await saveUser(editing)
    setBusy(false)
    setMessage({ ok: res.ok, text: res.message ?? '' })
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else if (res.fields) setFields(res.fields)
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-lg border border-border bg-bg">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-400 font-medium text-text">
                  {u.name}
                  {u.id === selfId && <span className="ms-2 text-200 text-text-subtle">(خودت)</span>}
                  {!u.active && <span className="ms-2 rounded bg-bg-sunken px-1.5 py-0.5 text-[0.7rem] text-text-muted">غیرفعال</span>}
                </p>
                <p className="latin mt-1 text-200 text-text-subtle">{u.email}</p>
                <p className="mt-1 text-200 text-text-subtle">
                  {u.lastLoginAt ? `آخرین ورود: ${new Date(u.lastLoginAt).toLocaleDateString('fa-IR')}` : 'هنوز وارد نشده'}
                  {' · '}
                  {u.articles.toLocaleString('fa-IR')} مقاله
                </p>
              </div>
              <span className="rounded-md border border-border px-2.5 py-1 text-200">{ROLE_LABELS[u.role]}</span>
              <button
                type="button"
                className="text-200 underline underline-offset-4"
                onClick={() => {
                  setMessage(null)
                  setFields({})
                  setEditing({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, password: '' })
                }}
              >
                ویرایش
              </button>
            </li>
          ))}
        </ul>

        <aside>
          {editing ? (
            <form onSubmit={save} className="space-y-5 rounded-lg border border-border bg-bg p-5">
              <p className="text-400 font-medium">{editing.id ? 'ویرایش کاربر' : 'کاربر تازه'}</p>
              <FormField id="u-name" label="نام" required error={fields.name}>
                <input id="u-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField id="u-email" label="ایمیل" required error={fields.email}>
                <input
                  id="u-email"
                  type="email"
                  dir="ltr"
                  autoComplete="off"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className={`latin ${inputClass}`}
                />
              </FormField>
              <FormField id="u-role" label="نقش" required hint={ROLE_DESCRIPTIONS[editing.role]}>
                <select
                  id="u-role"
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
                  className={inputClass}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                id="u-pass"
                label={editing.id ? 'گذرواژهٔ تازه' : 'گذرواژه'}
                required={!editing.id}
                hint={editing.id ? 'خالی بگذار تا عوض نشود. دست‌کم ۱۲ کاراکتر.' : 'دست‌کم ۱۲ کاراکتر. به‌صورت امن به کاربر بده.'}
                error={fields.password}
              >
                <input
                  id="u-pass"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  className={`latin ${inputClass}`}
                />
              </FormField>
              <label className="flex items-center gap-2.5 text-300">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="size-4"
                />
                فعال (می‌تواند وارد شود)
              </label>
              <div className="flex gap-3">
                <Button type="submit" loading={busy} className="flex-1">
                  ذخیره
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  انصراف
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setMessage(null)
                setEditing({ email: '', name: '', role: 'AUTHOR', active: true, password: '' })
              }}
            >
              کاربر تازه
            </Button>
          )}
          {message && (
            <p role="status" className={`mt-4 text-200 ${message.ok ? 'text-text-muted' : 'font-medium text-text'}`}>
              {!message.ok && <Icon name="alert" className="me-1.5" />}
              {message.text}
            </p>
          )}
        </aside>
      </div>

      <section aria-labelledby="matrix">
        <h2 id="matrix" className="text-500 font-bold">
          نقش‌ها و دسترسی‌ها
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg">
          <table className="w-full text-200">
            <thead>
              <tr className="border-b border-border text-text-subtle">
                <th className="p-3 text-start font-medium">دسترسی</th>
                {ROLES.map((r) => (
                  <th key={r} className="p-3 text-center font-medium">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p} className="border-b border-border last:border-0">
                  <td className="p-3">{PERMISSION_LABELS[p]}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="p-3 text-center">
                      {permissionsOf(r).includes(p) ? (
                        <Icon name="check" label="دارد" className="text-500 text-emerald" />
                      ) : (
                        <span className="text-text-subtle" aria-label="ندارد">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
