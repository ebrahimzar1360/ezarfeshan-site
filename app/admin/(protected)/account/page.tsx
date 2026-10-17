import { PasswordForm } from '@/components/admin/PasswordForm'
import { guard } from '@/lib/admin/guard'
import { PERMISSION_LABELS, ROLE_DESCRIPTIONS, ROLE_LABELS, permissionsOf } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await guard()
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">حساب من</h1>
      <div className="mb-10 max-w-2xl rounded-lg border border-border bg-bg p-6">
        <p className="text-400 font-bold">{user.name}</p>
        <p className="latin mt-1 text-200 text-text-subtle">{user.email}</p>
        <p className="mt-4 text-300">
          نقش: <strong>{ROLE_LABELS[user.role]}</strong> — {ROLE_DESCRIPTIONS[user.role]}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {permissionsOf(user.role).map((p) => (
            <li key={p} className="rounded border border-border px-2 py-0.5 text-200 text-text-muted">
              {PERMISSION_LABELS[p]}
            </li>
          ))}
        </ul>
      </div>
      <h2 className="mb-4 text-500 font-bold">تغییر گذرواژه</h2>
      <PasswordForm />
    </>
  )
}
