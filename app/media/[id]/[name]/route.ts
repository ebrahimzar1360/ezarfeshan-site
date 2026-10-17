import { db } from '@/lib/db'

/**
 * Public file delivery for the media library.
 *
 * The URL carries the id, so a file's address never changes and can be cached
 * for a year. The name segment is cosmetic (readable links, a sensible
 * download name); a wrong name still serves the file rather than 404ing an
 * image someone renamed.
 *
 * The response is locked down: nosniff so a browser never reinterprets the
 * bytes, and a sandboxing CSP in case a PDF viewer is ever asked to run
 * something. Only signature-checked types reach the table (lib/media/detect.ts).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id } = await params
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response('Not found', { status: 404 })

  const media = await db.media.findUnique({
    where: { id },
    select: { data: true, mimeType: true, sha256: true, fileName: true, size: true },
  })
  if (!media) return new Response('Not found', { status: 404 })

  const etag = `"${media.sha256}"`
  const headers = new Headers({
    'Content-Type': media.mimeType,
    'Content-Length': String(media.size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'Content-Disposition': `inline; filename="${media.fileName}"`,
  })

  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers })
  return new Response(new Uint8Array(media.data), { status: 200, headers })
}
