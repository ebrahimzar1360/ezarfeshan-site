import { describe, expect, it } from 'vitest'
import { projectRender, renderedCovers } from './renders'

const art = (slug: string, topic: string, coverImage: string | null = null) => ({ slug, coverImage, topics: [{ slug: topic }] })

describe('renderedCovers', () => {
  it('keeps an uploaded cover', () => {
    expect(renderedCovers([art('a', 'ai', '/media/1/x.webp')]).has('a')).toBe(false)
  })

  it('skips topics without renders', () => {
    expect(renderedCovers([art('a', 'unknown')]).size).toBe(0)
  })

  it('never repeats a render within one topic while variants remain', () => {
    const m = renderedCovers([art('one', 'team'), art('two', 'team')])
    expect(m.get('one')).not.toBe(m.get('two'))
    expect([...m.values()].every((u) => /^\/renders\/cover-team-[01]\.webp$/.test(u))).toBe(true)
  })

  it('is stable for a slug', () => {
    expect(renderedCovers([art('same', 'ai')]).get('same')).toBe(renderedCovers([art('same', 'ai')]).get('same'))
  })
})

describe('projectRender', () => {
  it('maps known mocks only', () => {
    expect(projectRender('tama')).toBe('/renders/project-tama.webp')
    expect(projectRender('other')).toBeNull()
  })
})
