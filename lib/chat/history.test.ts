import { describe, expect, it } from 'vitest'
import { packHistory, type ChatTurn } from './history'
// Relative, not aliased: vitest.config.ts declares no path alias, and `@/`
// resolves only under Next's build.
import { chatSchema } from '../validation'

/** Builds an alternating transcript of `n` turns, user first. */
function transcript(n: number, content = (i: number) => `پیام شماره ${i}`): ChatTurn[] {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
    content: content(i),
  }))
}

describe('packHistory', () => {
  it('passes a short conversation through untouched', () => {
    const turns = transcript(6)
    expect(packHistory(turns)).toEqual(turns)
  })

  it('keeps the opening turns when the conversation runs long', () => {
    // The reported failure: name given in turn one, asked about ten turns later.
    const turns: ChatTurn[] = [
      { role: 'user', content: 'سلام، من سیاوش هستم' },
      { role: 'assistant', content: 'سلام سیاوش' },
      ...transcript(40),
    ]

    const packed = packHistory(turns)
    expect(packed[0]?.content).toContain('سیاوش')
  })

  it('keeps the most recent turn when the conversation runs long', () => {
    const turns = transcript(40)
    const packed = packHistory(turns)
    expect(packed.at(-1)).toEqual(turns.at(-1))
  })

  it('marks the gap instead of splicing head onto tail silently', () => {
    const packed = packHistory(transcript(40))
    expect(packed.some((t) => t.content.includes('حذف شده'))).toBe(true)
  })

  it('truncates a single oversized turn rather than dropping it', () => {
    const packed = packHistory([{ role: 'user', content: 'الف'.repeat(5000) }])
    expect(packed).toHaveLength(1)
    expect(packed[0]?.content.length).toBeLessThanOrEqual(1001)
    expect(packed[0]?.content.endsWith('…')).toBe(true)
  })

  it('drops empty turns', () => {
    expect(packHistory([{ role: 'user', content: '   ' }])).toEqual([])
  })

  it('stays inside the character budget even with long turns', () => {
    const turns = transcript(40, () => 'ب'.repeat(900))
    const packed = packHistory(turns)
    const chars = packed.reduce((sum, t) => sum + t.content.length, 0)
    expect(chars).toBeLessThanOrEqual(6000)
    // The head must survive the character trim, not just the turn-count trim.
    expect(packed[0]).toEqual(turns[0])
  })

  it('produces a window the server will accept', () => {
    // A packed window that chatSchema rejects would surface as a 422 on the
    // eleventh message of a conversation and nowhere in development.
    for (const n of [0, 1, 7, 20, 21, 40, 200]) {
      const parsed = chatSchema.safeParse({
        message: 'سؤال',
        history: packHistory(transcript(n, (i) => `پیام ${i} `.repeat(30))),
      })
      expect(parsed.success, `n=${n}`).toBe(true)
    }
  })
})
