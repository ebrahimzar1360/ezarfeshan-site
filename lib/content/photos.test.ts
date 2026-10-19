import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { PHOTOS, projectPhoto, topicPhoto } from './photos'

describe('site photos', () => {
  // next/image reserves the box from these numbers: a wrong one is layout shift
  it.each(Object.entries(PHOTOS))('%s matches its file', async (_, p) => {
    const file = join(process.cwd(), 'public', p.src)
    expect(existsSync(file)).toBe(true)
    const meta = await sharp(file).metadata()
    expect(meta.format).toBe('webp')
    expect([meta.width, meta.height]).toEqual([p.width, p.height])
    expect(p.alt.length).toBeGreaterThan(10)
  })

  it('maps projects and topics by slug', () => {
    expect(projectPhoto('tama')?.src).toBe('/site-images/tama-auto-service.webp')
    expect(topicPhoto('team')?.src).toBe('/site-images/leadership-strategy.webp')
    expect(projectPhoto('gam')).toBeNull()
    expect(projectPhoto('budgetyar')).toBeNull()
    expect(topicPhoto('unknown')).toBeNull()
  })
})
