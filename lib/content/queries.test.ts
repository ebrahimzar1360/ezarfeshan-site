import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the publish filter against a bug that shipped once and was invisible
 * in every screenshot: `new Date()` written as a module-level constant is
 * evaluated when the module first loads, so the filter quietly means "published
 * before this server process started". Newly published and scheduled articles
 * stayed 404 until a restart.
 *
 * This reads the source rather than calling the query, because the failure is a
 * property of where the expression sits — not of any single result. A test that
 * called the function would pass either way inside one process.
 */

const source = readFileSync(join(import.meta.dirname, 'queries.ts'), 'utf8')

describe('publish filter', () => {
  it('does not evaluate new Date() at module scope', () => {
    // strip function bodies, then look for a Date construction in what is left
    const topLevel = source.replace(/(?:export\s+)?(?:async\s+)?function[\s\S]*?\n}/g, '')
    expect(topLevel).not.toMatch(/new Date\(\)/)
  })

  it('builds the filter inside a function so every query gets the current time', () => {
    expect(source).toMatch(/function publicFilter\(\)/)
    expect(source).toMatch(/publishedAt:\s*\{\s*lte:\s*new Date\(\)\s*\}/)
  })

  it('calls the filter rather than referencing a shared object', () => {
    expect(source).not.toMatch(/PUBLIC_FILTER/)
    // every read path has to go through it
    const calls = source.match(/publicFilter\(\)/g) ?? []
    expect(calls.length).toBeGreaterThanOrEqual(7)
  })

  it('filters on PUBLISHED status, not merely on a date', () => {
    expect(source).toMatch(/status:\s*'PUBLISHED'/)
  })
})
