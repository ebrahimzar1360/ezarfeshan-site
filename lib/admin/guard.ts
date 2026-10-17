import { redirect } from 'next/navigation'
import { currentUser, type AdminUser } from '@/lib/auth'
import { can, type Permission } from './permissions'

/**
 * For admin *pages*: sends a signed-out visitor to the login and a signed-in
 * one without the permission back to the dashboard with a note. Actions keep
 * their own requirePermission() — this only decides what a page renders.
 */
export async function guard(permission?: Permission): Promise<AdminUser> {
  const user = await currentUser()
  if (!user) redirect('/admin/login')
  if (permission && !can(user.role, permission)) redirect('/admin?denied=1')
  return user
}
