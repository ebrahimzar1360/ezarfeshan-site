/**
 * Who may do what in the admin.
 *
 * Pure data and pure functions, so the matrix is unit-tested and the same table
 * drives both the server checks (requirePermission) and what the admin UI
 * shows. Hiding a button is a courtesy; the server check is the rule.
 */

export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR'

export const PERMISSIONS = [
  'articles.write', // create and edit own articles as drafts
  'articles.editAny', // edit articles written by someone else
  'articles.publish', // publish, schedule, unpublish, delete
  'pages.manage', // free-standing pages
  'content.edit', // site copy: home, about, projects, header, footer…
  'media.upload',
  'media.manage', // edit or delete files uploaded by anyone
  'topics.manage',
  'leads.view',
  'subscribers.view',
  'users.manage',
  'audit.view',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const MATRIX: Record<Role, readonly Permission[]> = {
  ADMIN: PERMISSIONS,
  EDITOR: [
    'articles.write',
    'articles.editAny',
    'articles.publish',
    'pages.manage',
    'content.edit',
    'media.upload',
    'media.manage',
    'topics.manage',
    'leads.view',
    'subscribers.view',
  ],
  AUTHOR: ['articles.write', 'media.upload'],
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'مدیر کل',
  EDITOR: 'ویراستار',
  AUTHOR: 'نویسنده',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: 'دسترسی کامل، از جمله کاربران و گزارش تغییرات.',
  EDITOR: 'همهٔ محتوا: مقاله‌ها، صفحه‌ها، متن‌های سایت، رسانه، موضوع‌ها و درخواست‌ها.',
  AUTHOR: 'فقط مقاله‌های خودش را به‌صورت پیش‌نویس می‌نویسد و تصویر بارگذاری می‌کند؛ انتشار با ویراستار است.',
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  'articles.write': 'نوشتن مقاله',
  'articles.editAny': 'ویرایش مقالهٔ دیگران',
  'articles.publish': 'انتشار و حذف مقاله',
  'pages.manage': 'مدیریت صفحه‌ها',
  'content.edit': 'ویرایش متن‌ها و دکمه‌های سایت',
  'media.upload': 'بارگذاری رسانه',
  'media.manage': 'ویرایش و حذف همهٔ رسانه‌ها',
  'topics.manage': 'مدیریت موضوع‌ها',
  'leads.view': 'دیدن درخواست‌ها و پیام‌ها',
  'subscribers.view': 'دیدن مشترکین خبرنامه',
  'users.manage': 'مدیریت کاربران و نقش‌ها',
  'audit.view': 'دیدن گزارش تغییرات',
}

export function isRole(value: unknown): value is Role {
  return value === 'ADMIN' || value === 'EDITOR' || value === 'AUTHOR'
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  if (!isRole(role)) return false
  return MATRIX[role].includes(permission)
}

export function permissionsOf(role: Role): readonly Permission[] {
  return MATRIX[role]
}
