import { describe, expect, it } from 'vitest'
import { detectType, safeFileName } from './detect'

const bytes = (...v: number[]) => new Uint8Array([...v, ...new Array(16).fill(0)])
const text = (s: string) => new Uint8Array([...Array.from(s, (c) => c.charCodeAt(0)), ...new Array(16).fill(0)])

describe('detectType', () => {
  it('recognises images by signature', () => {
    expect(detectType(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe('image/jpeg')
    expect(detectType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe('image/png')
    expect(detectType(text('RIFF\0\0\0\0WEBPVP8 '))?.mime).toBe('image/webp')
    expect(detectType(text('%PDF-1.7'))?.mime).toBe('application/pdf')
  })
  it('refuses SVG and HTML whatever they are called', () => {
    expect(detectType(text('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull()
    expect(detectType(text('<!doctype html><script>'))).toBeNull()
  })
})

describe('safeFileName', () => {
  it('keeps Latin names readable', () => {
    expect(safeFileName('My Photo (1).JPG', 'webp')).toBe('my-photo-1.webp')
  })
  it('falls back for Persian names', () => {
    expect(safeFileName('عکس من.png', 'webp')).toBe('file.webp')
  })
})
