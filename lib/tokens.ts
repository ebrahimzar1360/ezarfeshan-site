import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Single-use tokens for newsletter confirm / unsubscribe links.
 *
 * Only the SHA-256 hash is stored. A database dump therefore cannot be replayed
 * into confirmations or unsubscribes, the same reason passwords are not stored
 * in the clear.
 *
 * Confirm and unsubscribe use separate tokens: a confirmation link forwarded to
 * someone else must not let them unsubscribe the original subscriber.
 */

export function createToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Constant-time compare, so a hash cannot be recovered by timing the response. */
export function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex')
  const bufB = Buffer.from(b, 'hex')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
