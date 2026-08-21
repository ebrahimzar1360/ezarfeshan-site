import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * Cookie-free page views.
 *
 * No cookie, no localStorage, no identifier that survives the day. sessionHash
 * is SHA-256 over (IP + user agent + today's date + a server secret), truncated.
 * The date makes it rotate every midnight, so the same visitor cannot be joined
 * across days; the secret stops anyone with the table from testing a guessed IP
 * against a stored hash.
 *
 * The raw address is never written anywhere — not to this table and not to a log.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { path?: string; referrer?: string } | null
    const path = typeof body?.path === 'string' ? body.path.slice(0, 500) : null
    if (!path || !path.startsWith('/')) {
      return Response.json({ ok: false }, { status: 400 })
    }

    // Never record the admin panel. 204 like every other success: a beacon has
    // nothing to read back, and a different status here would let a caller probe
    // which paths are treated specially.
    if (path.startsWith('/admin')) return new Response(null, { status: 204 })

    const salt = process.env.AUTH_SECRET ?? 'dev-salt'
    const day = new Date().toISOString().slice(0, 10)
    const ua = request.headers.get('user-agent') ?? ''
    const sessionHash = createHash('sha256')
      .update(`${clientIp(request.headers)}|${ua}|${day}|${salt}`)
      .digest('hex')
      .slice(0, 32)

    // Only keep a referrer from another site; an internal one just repeats the
    // journey already visible in the path column.
    let referrer: string | null = null
    const raw = typeof body?.referrer === 'string' ? body.referrer : ''
    if (raw) {
      try {
        const host = new URL(raw).host
        if (host && host !== new URL(request.url).host) referrer = raw.slice(0, 300)
      } catch {
        referrer = null
      }
    }

    await db.pageView.create({
      data: {
        path,
        referrer,
        sessionHash,
        country: request.headers.get('x-vercel-ip-country') ?? null,
      },
    })

    // 204: the beacon has nothing to read back
    return new Response(null, { status: 204 })
  } catch (cause) {
    console.error('[api:analytics]', cause)
    return new Response(null, { status: 204 })
  }
}
