import { createHash } from 'node:crypto'
import { db } from '@/lib/db'
import { MAX_IMAGE_WIDTH, MAX_UPLOAD_BYTES, detectType, mediaUrl, safeFileName } from './detect'

/**
 * Turning an upload into a library item.
 *
 * Raster images (except GIF, which may be animated) are re-encoded with sharp:
 * rotated to their EXIF orientation, scaled to at most MAX_IMAGE_WIDTH, and
 * written as WebP. Re-encoding also drops EXIF — including the GPS position a
 * phone photo carries, which nobody means to publish. next/image then serves
 * AVIF/WebP at the size each screen needs.
 */

export type MediaSummary = {
  id: string
  url: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alt: string
  caption: string | null
  createdAt: string
}

export type UploadResult =
  | { ok: true; media: MediaSummary; duplicate: boolean }
  | { ok: false; message: string }

export const SUMMARY_SELECT = {
  id: true,
  fileName: true,
  originalName: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  alt: true,
  caption: true,
  createdAt: true,
} as const

export function summarize(m: {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alt: string
  caption: string | null
  createdAt: Date
}): MediaSummary {
  return {
    id: m.id,
    url: mediaUrl(m.id, m.fileName),
    originalName: m.originalName,
    mimeType: m.mimeType,
    size: m.size,
    width: m.width,
    height: m.height,
    alt: m.alt,
    caption: m.caption,
    createdAt: m.createdAt.toISOString(),
  }
}

async function processImage(input: Buffer, mime: string) {
  const sharp = (await import('sharp')).default
  if (mime === 'image/gif') {
    const meta = await sharp(input, { animated: true }).metadata()
    return {
      data: input,
      mime,
      ext: 'gif',
      width: meta.width ?? null,
      height: meta.pageHeight ?? meta.height ?? null,
    }
  }
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true })
  return { data, mime: 'image/webp', ext: 'webp', width: info.width, height: info.height }
}

export async function storeUpload(
  file: { name: string; bytes: Buffer },
  meta: { alt?: string; uploadedById: string }
): Promise<UploadResult> {
  if (file.bytes.length === 0) return { ok: false, message: 'فایل خالی است.' }
  if (file.bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, message: 'حجم فایل بیشتر از ۱۰ مگابایت است.' }
  }
  const kind = detectType(file.bytes)
  if (!kind) {
    return { ok: false, message: 'این نوع فایل پذیرفته نمی‌شود. JPG، PNG، WebP، GIF، AVIF یا PDF بفرست.' }
  }

  let data: Buffer = file.bytes
  let mime = kind.mime
  let ext = kind.ext
  let width: number | null = null
  let height: number | null = null

  if (kind.image) {
    try {
      const out = await processImage(file.bytes, kind.mime)
      data = out.data
      mime = out.mime
      ext = out.ext
      width = out.width
      height = out.height
    } catch (cause) {
      console.error('[media] image processing failed', cause)
      return { ok: false, message: 'تصویر خوانده نشد؛ شاید فایل خراب است.' }
    }
  }

  const sha256 = createHash('sha256').update(data).digest('hex')
  const existing = await db.media.findUnique({ where: { sha256 }, select: SUMMARY_SELECT })
  if (existing) return { ok: true, media: summarize(existing), duplicate: true }

  const created = await db.media.create({
    data: {
      originalName: file.name.slice(0, 200) || 'file',
      fileName: safeFileName(file.name, ext),
      mimeType: mime,
      size: data.length,
      width,
      height,
      alt: (meta.alt ?? '').trim().slice(0, 300),
      sha256,
      data: new Uint8Array(data),
      uploadedById: meta.uploadedById,
    },
    select: SUMMARY_SELECT,
  })
  return { ok: true, media: summarize(created), duplicate: false }
}

/**
 * Where a file is used: article bodies, covers and share images, pages, and
 * site copy. Deleting a used file would leave broken images on live pages, so
 * the admin refuses until the references are gone.
 */
export async function mediaUsage(id: string): Promise<string[]> {
  const needle = `%/media/${id}/%`
  const [articles, pages, settings] = await Promise.all([
    db.$queryRaw<{ title: string }[]>`
      SELECT title FROM articles
      WHERE body ILIKE ${needle} OR cover_image ILIKE ${needle} OR og_image ILIKE ${needle}`,
    db.$queryRaw<{ title: string }[]>`
      SELECT title FROM pages WHERE body ILIKE ${needle} OR og_image ILIKE ${needle}`,
    db.$queryRaw<{ key: string }[]>`
      SELECT key FROM settings WHERE value::text ILIKE ${needle}`,
  ])
  return [
    ...articles.map((a) => `مقاله: ${a.title}`),
    ...pages.map((p) => `صفحه: ${p.title}`),
    ...settings.map((s) => `متن سایت: ${s.key.replace(/^content:/, '')}`),
  ]
}
