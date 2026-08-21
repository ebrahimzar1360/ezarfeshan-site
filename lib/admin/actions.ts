'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Admin write paths, as server actions.
 *
 * Every one calls requireAdmin() first. Server actions are reachable as POST
 * endpoints whether or not a page renders the form, so the check has to live in
 * the action itself — putting it only in the page or the middleware would leave
 * the action callable by anyone who knows its id. Next.js supplies the CSRF
 * protection for actions; authorisation is ours.
 */

const articleSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(3, 'اسلاگ دست‌کم ۳ کاراکتر.')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره — مثل system-building.'),
  title: z.string().trim().min(3, 'عنوان را وارد کن.').max(200),
  excerpt: z.string().trim().min(20, 'خلاصه دست‌کم ۲۰ کاراکتر.').max(500),
  body: z.string().min(1, 'متن مقاله خالی است.'),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']),
  publishedAt: z.string().optional(),
  featured: z.boolean().optional(),
  coverImage: z.string().trim().max(500).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(400).optional(),
  topicIds: z.array(z.string()).optional(),
})

export type ActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; message: string; fields?: Record<string, string> }

function zodFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fields[key]) fields[key] = issue.message
  }
  return fields
}

/** Persian reading estimate. ZWNJ joins compounds, so it is not a separator. */
function readingMinutes(text: string): number {
  const words = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[#*`>]/g, '')
    .trim()
    .split(/[\s ]+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export async function saveArticle(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = articleSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'اطلاعات کامل نیست.', fields: zodFields(parsed.error) }
  }

  const { id, topicIds, publishedAt, ...rest } = parsed.data

  // A scheduled post needs a date; a published one defaults to now.
  let when: Date | null = publishedAt ? new Date(publishedAt) : null
  if (rest.status === 'PUBLISHED' && !when) when = new Date()
  if (rest.status === 'SCHEDULED' && !when) {
    return {
      ok: false,
      message: 'برای انتشار زمان‌بندی‌شده باید تاریخ مشخص کنی.',
      fields: { publishedAt: 'تاریخ انتشار را انتخاب کن.' },
    }
  }

  const data = {
    ...rest,
    coverImage: rest.coverImage || null,
    seoTitle: rest.seoTitle || null,
    seoDescription: rest.seoDescription || null,
    publishedAt: when,
    readingMinutes: readingMinutes(rest.body),
    featured: rest.featured ?? false,
  }

  try {
    const article = id
      ? await db.article.update({
          where: { id },
          data: { ...data, topics: { set: (topicIds ?? []).map((t) => ({ id: t })) } },
        })
      : await db.article.create({
          data: { ...data, topics: { connect: (topicIds ?? []).map((t) => ({ id: t })) } },
        })

    // ISR caches the public pages; without this the edit is invisible until the
    // revalidate window expires.
    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath(`/articles/${article.slug}`)
    for (const t of topicIds ?? []) revalidatePath(`/topics/${t}`)

    return { ok: true, id: article.id, message: 'ذخیره شد.' }
  } catch (cause) {
    const message =
      cause instanceof Error && cause.message.includes('Unique constraint')
        ? 'این اسلاگ قبلاً استفاده شده. یکی دیگر انتخاب کن.'
        : 'ذخیره نشد — مشکلی در سرور پیش آمد.'
    console.error('[admin:saveArticle]', cause)
    return { ok: false, message }
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    const article = await db.article.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath(`/articles/${article.slug}`)
    return { ok: true, message: 'مقاله حذف شد.' }
  } catch (cause) {
    console.error('[admin:deleteArticle]', cause)
    return { ok: false, message: 'حذف نشد.' }
  }
}

const topicSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط حروف کوچک لاتین، عدد و خط تیره.'),
  name: z.string().trim().min(2, 'نام موضوع را وارد کن.').max(80),
  description: z.string().trim().max(400).optional(),
})

export async function saveTopic(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = topicSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'اطلاعات کامل نیست.', fields: zodFields(parsed.error) }
  }
  const { id, ...data } = parsed.data
  try {
    const topic = id
      ? await db.topic.update({ where: { id }, data })
      : await db.topic.create({ data })
    revalidatePath('/articles')
    revalidatePath(`/topics/${topic.slug}`)
    return { ok: true, id: topic.id, message: 'ذخیره شد.' }
  } catch (cause) {
    console.error('[admin:saveTopic]', cause)
    return { ok: false, message: 'ذخیره نشد. شاید این اسلاگ تکراری است.' }
  }
}

export async function deleteTopic(id: string): Promise<ActionResult> {
  await requireAdmin()
  const count = await db.article.count({ where: { topics: { some: { id } } } })
  if (count > 0) {
    return {
      ok: false,
      message: `این موضوع به ${count} مقاله وصل است. اول آن‌ها را به موضوع دیگری منتقل کن.`,
    }
  }
  await db.topic.delete({ where: { id } })
  revalidatePath('/articles')
  return { ok: true, message: 'موضوع حذف شد.' }
}

const leadUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']),
  note: z.string().trim().max(2000).optional(),
})

export async function updateLead(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = leadUpdateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: 'اطلاعات کامل نیست.' }
  const { id, ...data } = parsed.data
  await db.lead.update({ where: { id }, data: { ...data, note: data.note || null } })
  revalidatePath('/admin/leads')
  return { ok: true, message: 'به‌روز شد.' }
}

export async function signOutAdmin() {
  const { signOut } = await import('@/lib/auth')
  await signOut({ redirect: false })
  redirect('/admin/login')
}
