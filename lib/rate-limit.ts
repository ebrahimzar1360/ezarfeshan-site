import { createHash } from 'node:crypto'
import { db } from './db'

/**
 * Fixed-window rate limiting, held in Postgres so the stack needs no Redis.
 *
 * A fixed window allows a burst across a boundary — up to 2x the limit in a
 * short span. For the volumes this site handles that is acceptable, and it is
 * far simpler than a sliding log. Revisit if the traffic ever justifies it.
 */

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number }

export async function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  // hashed so the table never holds a raw address or email
  const hashed = createHash('sha256').update(key).digest('hex').slice(0, 40)

  const existing = await db.rateLimit.findUnique({ where: { key: hashed } })

  if (!existing || existing.windowStart < windowStart) {
    await db.rateLimit.upsert({
      where: { key: hashed },
      update: { count: 1, windowStart: now },
      create: { key: hashed, count: 1, windowStart: now },
    })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    const elapsed = (now.getTime() - existing.windowStart.getTime()) / 1000
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(windowSeconds - elapsed)),
    }
  }

  await db.rateLimit.update({
    where: { key: hashed },
    data: { count: { increment: 1 } },
  })
  return { ok: true, remaining: limit - existing.count - 1, retryAfterSeconds: 0 }
}

/** Best-effort sweep of expired rows. Called opportunistically, never awaited. */
export async function sweepRateLimits(olderThanSeconds = 3600): Promise<void> {
  try {
    await db.rateLimit.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - olderThanSeconds * 1000) } },
    })
  } catch {
    // sweeping is housekeeping; failing it must never fail a request
  }
}

/**
 * Client address from the proxy headers. Falls back to a constant so a missing
 * header degrades to a shared bucket rather than to no limiting at all.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
