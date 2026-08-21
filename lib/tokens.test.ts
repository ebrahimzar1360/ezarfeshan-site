import { describe, expect, it } from 'vitest'
import { createToken, hashToken, tokensMatch } from './tokens'

describe('tokens', () => {
  it('never returns the same token twice', () => {
    const seen = new Set(Array.from({ length: 200 }, () => createToken().token))
    expect(seen.size).toBe(200)
  })

  it('produces a url-safe token', () => {
    // it goes into an email link; + / = would break on some clients
    for (let i = 0; i < 50; i++) {
      expect(createToken().token).toMatch(/^[A-Za-z0-9_-]+$/)
    }
  })

  it('stores a hash, never the token itself', () => {
    const { token, hash } = createToken()
    expect(hash).not.toBe(token)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).toBe(hashToken(token))
  })

  it('matches identical hashes and rejects different ones', () => {
    const a = hashToken('one')
    const b = hashToken('two')
    expect(tokensMatch(a, a)).toBe(true)
    expect(tokensMatch(a, b)).toBe(false)
  })

  it('returns false instead of throwing on a malformed hash', () => {
    // a tampered link must fail closed, not crash the route
    expect(tokensMatch(hashToken('x'), 'short')).toBe(false)
    expect(tokensMatch(hashToken('x'), '')).toBe(false)
  })
})
