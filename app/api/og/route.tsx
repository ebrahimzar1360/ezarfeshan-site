import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { zwnjSafe } from '@/lib/rtl-text'
import { site } from '@/lib/site'

// Node runtime, not edge: the font is read from disk, and it lives outside
// public/ so it is never served to visitors.
export const runtime = 'nodejs'

const INK = '#1A1A1A'
const PAPER = '#F5F5F0'
const GOLD = '#C8A84B'

/** Cover art is 3:2; the Open Graph card stays at its required 1200x630. */
const COVER = { width: 1200, height: 800 }
const OG = { width: 1200, height: 630 }

/**
 * A stable number per slug, so one article always draws the same cover.
 * djb2 — not for security, only to spread similar slugs apart.
 */
function hash(seed: string): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0
  return h
}

let fontCache: Buffer | null = null
function vazirmatn(): Buffer {
  fontCache ??= readFileSync(join(process.cwd(), 'assets', 'fonts', 'vazirmatn-700.ttf'))
  return fontCache
}

/**
 * Satori joins Arabic letterforms correctly but has no bidi algorithm: it lays
 * words out left to right, so "سیستم بساز، آزاد باش" renders reversed.
 *
 * Reversing the string is not enough. It fixes a single line and then breaks
 * the moment the text wraps, because the first visual line ends up holding the
 * last words of the sentence — which is what the first attempt here did.
 *
 * Instead each word becomes its own flex item in a `row-reverse` + `wrap`
 * container. That is genuinely RTL layout: items flow from the right edge and
 * wrap downward in the correct order, and each word keeps the shaping Satori
 * already gets right.
 *
 * Latin text must not pass through this — it is rendered as a plain string.
 */
function RtlText({
  text,
  style,
}: {
  text: string
  style?: Record<string, string | number>
}) {
  const words = text.trim().split(/\s+/).map(zwnjSafe)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        // gap, not per-word margins: in row-reverse a margin sits on the visually
        // trailing edge and the spacing came out uneven
        columnGap: 14,
        rowGap: 4,
        ...style,
      }}
    >
      {words.map((word, i) => (
        <span key={i}>{word}</span>
      ))}
    </div>
  )
}

/**
 * Cover grounds, chosen per slug. Two night grounds and the warm sand, so a
 * list of covers alternates instead of reading as a wall of one colour.
 */
const GROUNDS = [
  { bg: '#0E2219', grid: 'rgba(245,245,240,0.06)', text: PAPER, sub: 'rgba(245,245,240,0.62)', accent: '#E2C97E', slab: ['#24533B', '#173828', '#1D4632'], edge: 'rgba(245,245,240,0.22)' },
  { bg: '#1A3D2B', grid: 'rgba(245,245,240,0.07)', text: PAPER, sub: 'rgba(245,245,240,0.62)', accent: '#E2C97E', slab: ['#3A7C5D', '#22533C', '#2C6649'], edge: 'rgba(245,245,240,0.25)' },
  { bg: '#ECE7DA', grid: 'rgba(26,26,26,0.06)', text: INK, sub: 'rgba(26,26,26,0.6)', accent: '#1A3D2B', slab: ['#2D6A4F', '#1A3D2B', '#24583F'], edge: 'rgba(245,245,240,0.3)' },
] as const

/**
 * The homepage's system stack, drawn flat in isometric for a cover. Slab
 * count, which layer is gold, and how far apart the layers sit all come from
 * the slug, so every article gets its own arrangement of the same idea.
 *
 * An SVG string handed to Satori as a data-URI image: Satori draws <img> SVGs
 * faithfully, while its own CSS has no polygons.
 */
function stackSvg(seed: string, ground: (typeof GROUNDS)[number], w: number, h: number) {
  const n = hash(seed)
  const count = 3 + (n % 2)
  const goldAt = (n >>> 3) % count
  const gap = [10, 26, 44][(n >>> 6) % 3]!
  const a = 190
  const b = Math.round(a * 0.577)
  const t = 40
  const cx = Math.round(w * 0.3)
  const total = count * t + (count - 1) * gap
  const baseY = Math.round(h / 2 + total / 2)

  const cell = 48
  let grid = ''
  for (let x = 0; x <= w; x += cell) grid += `<path d="M${x} 0V${h}" stroke="${ground.grid}"/>`
  for (let y = 0; y <= h; y += cell) grid += `<path d="M0 ${y}H${w}" stroke="${ground.grid}"/>`

  let slabs = ''
  for (let i = 0; i < count; i++) {
    const cy = baseY - b - i * (t + gap) - t
    const gold = i === goldAt
    const [top, left, right] = gold ? ['#D8BD6A', '#A68A3A', '#C8A84B'] : ground.slab
    const edge = gold ? 'rgba(243,226,173,0.7)' : ground.edge
    slabs +=
      `<path d="M${cx - a} ${cy} L${cx} ${cy + b} L${cx} ${cy + b + t} L${cx - a} ${cy + t}Z" fill="${left}" stroke="${edge}"/>` +
      `<path d="M${cx} ${cy + b} L${cx + a} ${cy} L${cx + a} ${cy + t} L${cx} ${cy + b + t}Z" fill="${right}" stroke="${edge}"/>` +
      `<path d="M${cx} ${cy - b} L${cx + a} ${cy} L${cx} ${cy + b} L${cx - a} ${cy}Z" fill="${top}" stroke="${edge}"/>`
  }
  const topY = baseY - b - (count - 1) * (t + gap) - t
  const ring = `<ellipse cx="${cx}" cy="${baseY - total / 2 - b / 2}" rx="${a * 1.45}" ry="${b * 1.45}" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="${Math.round(a * 6.2)} 120"/>`
  const bead = `<circle cx="${cx}" cy="${topY - b - 70}" r="16" fill="${GOLD}"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${grid}${ring}${slabs}${bead}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Article cover art: night or sand ground, blueprint grid, the system stack,
 * and the topic kicker. No title on it — a list page already prints the title
 * as a heading, and repeating it twenty pixels above reads as a bug.
 *
 * Same constraint as the rest of this file: no `direction: rtl`. Satori does not
 * act on it for ordering, so Persian text goes through RtlText, Latin never
 * does, and the gold bar comes last because the block is right-aligned.
 */
function cover(kicker: string, seed: string, compact = false) {
  const ground = GROUNDS[hash(seed + 'g') % GROUNDS.length]!
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: ground.bg,
        padding: '72px 80px',
      }}
    >
      <img
        src={stackSvg(seed, ground, COVER.width, COVER.height)}
        width={COVER.width}
        height={COVER.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      <div style={{ display: 'flex', flex: 1, gap: 30, alignItems: 'stretch' }}>
        {/* At a thumbnail the type would render below four pixels, so the
            compact size keeps only the art and the gold marker. */}
        {!compact && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flex: 1,
            }}
          >
            <RtlText text={kicker} style={{ fontSize: 38, color: ground.sub }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <RtlText text={site.name} style={{ fontSize: 44, color: ground.text }} />
              {/* Latin, so it must NOT go through RtlText */}
              <div style={{ fontSize: 22, color: ground.sub, marginTop: 8 }}>{site.nameLatin}</div>
            </div>
          </div>
        )}
        {compact && <div style={{ display: 'flex', flex: 1 }} />}
        <div style={{ width: compact ? 26 : 12, background: GOLD, borderRadius: 6 }} />
      </div>
    </div>
  )
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const rawTitle = params.get('title')?.slice(0, 120) || site.tagline
  const rawKicker = params.get('kicker')?.slice(0, 60) || site.role

  if (params.get('variant') === 'cover') {
    const compact = params.get('compact') === '1'
    return new ImageResponse(cover(rawKicker, params.get('seed') ?? '', compact), {
      ...COVER,
      fonts: [{ name: 'Vazirmatn', data: vazirmatn(), weight: 700, style: 'normal' }],
      // A cover is pure function of (kicker, seed): it can never go stale, and
      // without a long s-maxage every ISR regeneration re-runs Satori per card.
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=31536000, immutable' },
    })
  }

  return new ImageResponse(
    (
      // No `direction: rtl` anywhere. Satori does not act on it for ordering, so
      // relying on it produced a layout that was mirrored in some places and not
      // others. Everything below is positioned explicitly for a left-to-right
      // engine, with text right-aligned by hand.
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '72px 80px',
          fontFamily: 'Vazirmatn',
        }}
      >
        <div style={{ display: 'flex', flex: 1, gap: 30 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              flex: 1,
            }}
          >
            <RtlText text={rawKicker} style={{ fontSize: 26, color: 'rgba(26,26,26,0.55)', marginBottom: 22 }} />
            <RtlText text={rawTitle} style={{ fontSize: 62, color: INK, lineHeight: 1.4 }} />
          </div>
          {/* the gold marker, on the inline-start edge — which for this
              right-aligned block is the right side, so it comes last */}
          <div style={{ width: 10, background: GOLD, borderRadius: 5 }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(26,26,26,0.14)',
            paddingTop: 30,
          }}
        >
          {/* Latin, so it must NOT go through RtlText */}
          <div style={{ fontSize: 24, color: 'rgba(26,26,26,0.45)' }}>{site.nameLatin}</div>
          <RtlText text={site.name} style={{ fontSize: 30, color: INK }} />
        </div>
      </div>
    ),
    {
      ...OG,
      fonts: [{ name: 'Vazirmatn', data: vazirmatn(), weight: 700, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400, immutable' },
    }
  )
}
