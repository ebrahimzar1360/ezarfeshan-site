import { UserManager } from '@/components/admin/UserManager'
import { guard } from '@/lib/admin/guard'
import { isRole } from '@/lib/admin/permissions'
import { getUsers } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const me = await guard('users.manage')
  const users = await getUsers()
  return (
    <>
      <h1 className="gold-marker mb-3 text-700">کاربران و دسترسی</h1>
      <p className="mb-8 max-w-3xl text-300 leading-prose text-text-muted">
        ثبت‌نام عمومی وجود ندارد؛ هر حساب را همین‌جا می‌سازی. کاربر غیرفعال‌شده در همان لحظه از پنل بیرون می‌رود و تاریخچه‌اش
        می‌ماند.
      </p>
      <UserManager
        selfId={me.id}
        users={users
          .filter((u) => isRole(u.role))
          .map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role as 'ADMIN' | 'EDITOR' | 'AUTHOR',
            active: u.active,
            lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
            articles: u._count.articles,
          }))}
      />
    </>
  )
}
