'use server'

import { hash } from '@node-rs/argon2'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/admin/audit'
import { can, isRole } from '@/lib/admin/permissions'
import { requirePermission } from '@/lib/auth'
import { CONTENT_PREFIX } from '@/lib/cms/content'
import { validateValues } from '@/lib/cms/normalize'
import { SECTIONS, isSectionKey } from '@/lib/cms/registry'
import { db } from '@/lib/db'
import { mediaUsage } from '@/lib/media/store'
import type { ActionResult } from './actions'

/**
 * Server actions for the CMS: site copy, media, pages and users.
 * Same rule as lib/admin/actions.ts — each one checks its own permission.
 */

/** Site copy can appear on any page (header, footer), so the whole tree is revalidated. */
function revalidateSite() {
  revalidatePath('/', 'layout')
}

// ------------------------------------------------------------------ site copy

export async function saveContentSection(key: string, values: unknown): Promise<ActionResult> {
  const user = await requirePermission('content.edit')
  if (!isSectionKey(key)) return { ok: false, message: 'این بخش وجود ندارد.' }

  const result = validateValues(SECTIONS[key].fields, values)
  if (!result.ok) {
    return { ok: false, message: 'چند مورد را باید درست کنی.', fields: result.errors }
  }

  // Projects are addressed by slug (anchors, keys); two with one slug collide.
  if (key === 'projects.items') {
    const items = result.values.items as { slug: string }[]
    const bad = items.findIndex((p) => !/^[a-z0-9-]+$/.test(p.slug))
    if (bad >= 0) return { ok: false, message: 'شناسهٔ پروژه فقط حروف کوچک لاتین، عدد و خط تیره.', fields: { [`items.${bad}.slug`]: 'فقط a-z، 0-9 و -' } }
    const seen = new Set<string>()
    for (const [i, p] of items.entries()) {
      if (seen.has(p.slug)) return { ok: false, message: 'شناسهٔ تکراری.', fields: { [`items.${i}.slug`]: 'این شناسه تکراری است.' } }
      seen.add(p.slug)
    }
  }

  await db.setting.upsert({
    where: { key: CONTENT_PREFIX + key },
    create: { key: CONTENT_PREFIX + key, value: result.values as object },
    update: { value: result.values as object },
  })
  revalidateSite()
  await audit(user, 'update', 'content', key, SECTIONS[key].label)
  return { ok: true, message: 'ذخیره شد و روی سایت اعمال شد.' }
}

export async function resetContentSection(key: string): Promise<ActionResult> {
  const user = await requirePermission('content.edit')
  if (!isSectionKey(key)) return { ok: false, message: 'این بخش وجود ندارد.' }
  await db.setting.deleteMany({ where: { key: CONTENT_PREFIX + key } })
  revalidateSite()
  await audit(user, 'reset', 'content', key, SECTIONS[key].label)
  return { ok: true, message: 'به متن پیش‌فرض برگشت.' }
}

// ------------------------------------------------------------------ media

const mediaSchema = z.object({
  id: z.string().min(1),
  alt: z.string().trim().max(300, 'متن جایگزین حداکثر ۳۰۰ کاراکتر.'),
  caption: z.string().trim().max(500).optional(),
})

export async function updateMedia(input: unknown): Promise<ActionResult> {
  const user = await requirePermission('media.upload')
  const parsed = mediaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'اطلاعات کامل نیست.' }
  const { id, alt, caption } = parsed.data
  const media = await db.media.findUnique({ where: { id }, select: { uploadedById: true } })
  if (!media) return { ok: false, message: 'این فایل پیدا نشد.' }
  if (media.uploadedById !== user.id && !can(user.role, 'media.manage')) {
    return { ok: false, message: 'فقط فایل‌های خودت را می‌توانی ویرایش کنی.' }
  }
  await db.media.update({ where: { id }, data: { alt, caption: caption || null } })
  await audit(user, 'update', 'media', id, alt)
  return { ok: true, message: 'ذخیره شد.' }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const user = await requirePermission('media.upload')
  const media = await db.media.findUnique({ where: { id }, select: { uploadedById: true, originalName: true } })
  if (!media) return { ok: false, message: 'این فایل پیدا نشد.' }
  if (media.uploadedById !== user.id && !can(user.role, 'media.manage')) {
    return { ok: false, message: 'فقط فایل‌های خودت را می‌توانی حذف کنی.' }
  }
  const usage = await mediaUsage(id)
  if (usage.length) {
    return { ok: false, message: `این فایل استفاده شده و حذف نمی‌شود: ${usage.slice(0, 3).join('، ')}${usage.length > 3 ? '…' : ''}` }
  }
  await db.media.delete({ where: { id } })
  await audit(user, 'delete', 'media', id, media.originalName)
  return { ok: true, message: 'فایل حذف شد.' }
}

// ------------------------------------------------------------------ pages

/** Slugs the app already routes; a page there would never be reached. */
const RESERVED = new Set([
  'about', 'admin', 'api', 'articles', 'consult', 'contact', 'media', 'newsletter',
  'projects', 'resources', 'rss.xml', 'search', 'sitemap.xml', 'robots.txt', 'topics',
  'brand', 'photos', 'fonts', 'projects', '_next',
])
const pageSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2, 'نشانی دست‌کم ۲ کاراکتر.')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'نشانی فقط حروف کوچک لاتین، عدد و خط تیره.'),
  title: z.string().trim().min(2, 'عنوان را بنویس.').max(200),
  lead: z.string().trim().max(500).optional(),
  body: z.string().min(1, 'متن صفحه خالی است.'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(400).optional(),
  ogImage: z.string().trim().max(500).regex(/^\/(?!\/)/).optional(),
  noindex: z.boolean().optional(),
})

export async function savePage(input: unknown): Promise<ActionResult> {
  const user = await requirePermission('pages.manage')
  const parsed = pageSchema.safeParse(input)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const i of parsed.error.issues) {
      const k = i.path[0]
      if (typeof k === 'string' && !fields[k]) fields[k] = i.message
    }
    return { ok: false, message: 'اطلاعات کامل نیست.', fields }
  }
  const { id, ...d } = parsed.data
  if (RESERVED.has(d.slug)) {
    return { ok: false, message: 'این نشانی مال یکی از صفحه‌های ثابت سایت است.', fields: { slug: 'نشانی دیگری انتخاب کن.' } }
  }
  const before = id ? await db.page.findUnique({ where: { id }, select: { slug: true, publishedAt: true } }) : null
  const data = {
    ...d,
    lead: d.lead || null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    ogImage: d.ogImage || null,
    noindex: d.noindex ?? false,
    publishedAt: d.status === 'PUBLISHED' ? (before?.publishedAt ?? new Date()) : null,
  }
  try {
    const page = id ? await db.page.update({ where: { id }, data }) : await db.page.create({ data })
    revalidatePath(`/${page.slug}`)
    if (before && before.slug !== page.slug) revalidatePath(`/${before.slug}`)
    revalidatePath('/sitemap.xml')
    await audit(user, id ? 'update' : 'create', 'page', page.id, page.title)
    return { ok: true, id: page.id, message: 'ذخیره شد.' }
  } catch (cause) {
    const unique = cause instanceof Error && cause.message.includes('Unique constraint')
    if (!unique) console.error('[admin:savePage]', cause)
    return unique
      ? { ok: false, message: 'این نشانی قبلاً استفاده شده.', fields: { slug: 'نشانی تکراری است.' } }
      : { ok: false, message: 'ذخیره نشد — مشکلی در سرور پیش آمد.' }
  }
}

export async function deletePage(id: string): Promise<ActionResult> {
  const user = await requirePermission('pages.manage')
  const page = await db.page.delete({ where: { id } }).catch(() => null)
  if (!page) return { ok: false, message: 'این صفحه پیدا نشد.' }
  revalidatePath(`/${page.slug}`)
  revalidatePath('/sitemap.xml')
  await audit(user, 'delete', 'page', id, page.title)
  return { ok: true, message: 'صفحه حذف شد.' }
}

// ------------------------------------------------------------------ users

const password = z
  .string()
  .min(12, 'گذرواژه دست‌کم ۱۲ کاراکتر.')
  .max(200)

const userSchema = z.object({
  id: z.string().optional(),
  email: z.email('ایمیل معتبر نیست.').trim().toLowerCase(),
  name: z.string().trim().min(2, 'نام را بنویس.').max(80),
  role: z.string().refine(isRole, 'نقش معتبر نیست.'),
  active: z.boolean(),
  password: z.union([password, z.literal('')]).optional(),
})

/** Same Argon2id parameters as tools/db/create-admin.mjs and DUMMY_HASH in lib/auth.ts. */
function hashPassword(plain: string) {
  return hash(plain, { memoryCost: 19456, timeCost: 2, parallelism: 1 })
}

export async function saveUser(input: unknown): Promise<ActionResult> {
  const actor = await requirePermission('users.manage')
  const parsed = userSchema.safeParse(input)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const i of parsed.error.issues) {
      const k = i.path[0]
      if (typeof k === 'string' && !fields[k]) fields[k] = i.message
    }
    return { ok: false, message: 'اطلاعات کامل نیست.', fields }
  }
  const { id, password: plain, role, ...rest } = parsed.data
  if (!isRole(role)) return { ok: false, message: 'نقش معتبر نیست.' }

  if (!id && !plain) return { ok: false, message: 'برای کاربر تازه گذرواژه لازم است.', fields: { password: 'گذرواژه را بنویس.' } }

  // The last active admin cannot demote or disable themselves out of the door.
  if (id) {
    const target = await db.user.findUnique({ where: { id }, select: { role: true, active: true } })
    if (!target) return { ok: false, message: 'این کاربر پیدا نشد.' }
    const losingAdmin = target.role === 'ADMIN' && target.active && (role !== 'ADMIN' || !rest.active)
    if (losingAdmin) {
      const admins = await db.user.count({ where: { role: 'ADMIN', active: true } })
      if (admins <= 1) return { ok: false, message: 'دست‌کم یک مدیر کل فعال باید بماند.' }
    }
  }

  try {
    const data = { ...rest, role, ...(plain ? { passwordHash: await hashPassword(plain) } : {}) }
    const user = id
      ? await db.user.update({ where: { id }, data })
      : await db.user.create({ data: { ...data, passwordHash: data.passwordHash ?? (await hashPassword(plain!)) } })
    await audit(actor, id ? 'update' : 'create', 'user', user.id, `${user.email} → ${role}${rest.active ? '' : ' (غیرفعال)'}${plain ? ' + گذرواژه' : ''}`)
    revalidatePath('/admin/users')
    return { ok: true, id: user.id, message: 'ذخیره شد.' }
  } catch (cause) {
    const unique = cause instanceof Error && cause.message.includes('Unique constraint')
    if (!unique) console.error('[admin:saveUser]', cause)
    return unique
      ? { ok: false, message: 'این ایمیل قبلاً ثبت شده.', fields: { email: 'ایمیل تکراری است.' } }
      : { ok: false, message: 'ذخیره نشد — مشکلی در سرور پیش آمد.' }
  }
}

/** Any signed-in user changes their own password; the current one is required. */
export async function changeOwnPassword(input: unknown): Promise<ActionResult> {
  const { requireUser } = await import('@/lib/auth')
  const user = await requireUser()
  const parsed = z.object({ current: z.string().min(1), next: password }).safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'اطلاعات کامل نیست.' }
  }
  const { verify } = await import('@node-rs/argon2')
  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
  const ok = row ? await verify(row.passwordHash, parsed.data.current).catch(() => false) : false
  if (!ok) return { ok: false, message: 'گذرواژهٔ فعلی درست نیست.' }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } })
  await audit(user, 'password', 'user', user.id, 'تغییر گذرواژهٔ خود')
  return { ok: true, message: 'گذرواژه عوض شد.' }
}
