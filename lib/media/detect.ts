/**
 * File type by content, not by the name or the browser's claim.
 *
 * The Content-Type of an upload is whatever the client says, and a file named
 * photo.jpg can be anything. Only these signatures are accepted. SVG is left
 * out on purpose: it is a document that can carry script, and serving one from
 * our own origin would be a stored-XSS hole.
 */
export type MediaKind = { mime: string; ext: string; image: boolean }

export function detectType(bytes: Uint8Array): MediaKind | null {
  const b = bytes
  const at = (i: number, ...sig: number[]) => sig.every((v, k) => b[i + k] === v)
  const ascii = (i: number, s: string) => at(i, ...Array.from(s, (c) => c.charCodeAt(0)))

  if (at(0, 0xff, 0xd8, 0xff)) return { mime: 'image/jpeg', ext: 'jpg', image: true }
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: 'image/png', ext: 'png', image: true }
  if (ascii(0, 'GIF87a') || ascii(0, 'GIF89a')) return { mime: 'image/gif', ext: 'gif', image: true }
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return { mime: 'image/webp', ext: 'webp', image: true }
  if (ascii(4, 'ftyp') && (ascii(8, 'avif') || ascii(8, 'avis'))) return { mime: 'image/avif', ext: 'avif', image: true }
  if (ascii(0, '%PDF-')) return { mime: 'application/pdf', ext: 'pdf', image: false }
  return null
}

/** A Latin, URL-safe file name. Persian names become `file` — the id keeps it unique anyway. */
export function safeFileName(original: string, ext: string): string {
  const base = original
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'file'}.${ext}`
}

export function mediaUrl(id: string, fileName: string): string {
  return `/media/${id}/${fileName}`
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
/** Images wider than this are scaled down; nothing on the site is drawn wider. */
export const MAX_IMAGE_WIDTH = 2400
