import { NextResponse } from 'next/server'
import { audit } from '@/lib/admin/audit'
import { can } from '@/lib/admin/permissions'
import { currentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SUMMARY_SELECT, storeUpload, summarize } from '@/lib/media/store'

/**
 * Media library API for the admin: GET lists, POST uploads (multipart).
 *
 * A route handler rather than a server action because server actions cap the
 * body at 1 MB and an upload needs ten. Route handlers get none of the
 * framework's action CSRF protection, so the Origin check below is ours: the
 * session cookie is SameSite=Lax, which already keeps it off a cross-site
 * POST, and the Origin check makes that explicit instead of incidental.
 */

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

const PAGE_SIZE = 48

export async function GET(request: Request) {
  const user = await currentUser()
  if (!user || !can(user.role, 'media.upload')) {
    return NextResponse.json({ ok: false, error: { message: 'دسترسی نداری.' } }, { status: 403 })
  }
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim().slice(0, 100) ?? ''
  const kind = url.searchParams.get('kind')
  const cursor = url.searchParams.get('cursor')

  const items = await db.media.findMany({
    where: {
      ...(q
        ? { OR: [{ originalName: { contains: q, mode: 'insensitive' } }, { alt: { contains: q, mode: 'insensitive' } }] }
        : {}),
      ...(kind === 'image' ? { mimeType: { startsWith: 'image/' } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: SUMMARY_SELECT,
  })

  const hasMore = items.length > PAGE_SIZE
  const page = items.slice(0, PAGE_SIZE)
  return NextResponse.json({
    ok: true,
    items: page.map(summarize),
    nextCursor: hasMore ? page[page.length - 1]?.id : null,
  })
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: { message: 'درخواست نامعتبر.' } }, { status: 403 })
  }
  const user = await currentUser()
  if (!user || !can(user.role, 'media.upload')) {
    return NextResponse.json({ ok: false, error: { message: 'دسترسی نداری.' } }, { status: 403 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: { message: 'فایلی دریافت نشد.' } }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: { message: 'فایلی دریافت نشد.' } }, { status: 400 })
  }

  const alt = typeof form.get('alt') === 'string' ? String(form.get('alt')) : ''
  const result = await storeUpload(
    { name: file.name, bytes: Buffer.from(await file.arrayBuffer()) },
    { alt, uploadedById: user.id }
  )
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: { message: result.message } }, { status: 422 })
  }
  if (!result.duplicate) await audit(user, 'upload', 'media', result.media.id, result.media.originalName)
  return NextResponse.json({ ok: true, media: result.media, duplicate: result.duplicate })
}
