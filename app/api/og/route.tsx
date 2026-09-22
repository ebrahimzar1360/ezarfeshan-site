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

/**
 * Hairlines derived from the slug.
 *
 * The brief bans gradients, patterns and stock photography, so a cover cannot be
 * decorated — but a wall of identical paper rectangles is not a cover either.
 * Five vertical rules at slug-derived positions and widths give each article a
 * recognisable fingerprint using nothing but the existing ink tint, at an
 * opacity low enough to read as texture rather than as content.
 */
function rules(seed: string) {
  const h = hash(seed)
  return Array.from({ length: 5 }, (_, i) => {
    const n = (h >> (i * 5)) & 0x1f
    return {
      insetInlineStart: `${6 + i * 19 + (n % 7)}%`,
      width: n % 3 === 0 ? 3 : 1,
      opacity: 0.05 + (n % 4) * 0.02,
    }
  })
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
 * Article cover art: the same ground and the same gold marker as the Open Graph
 * card, but with no title on it.
 *
 * Deliberate: a list page already prints the title as a heading, so repeating it
 * twenty pixels above reads as a rendering bug rather than as design. What a
 * cover has to do here is distinguish one article from another at a glance,
 * which the topic kicker and the slug-derived rules do.
 *
 * Same constraint as the rest of this file: no `direction: rtl`. Satori does not
 * act on it for ordering, so Persian text goes through RtlText, Latin never
 * does, and the gold bar comes last because the block is right-aligned.
 */
function cover(kicker: string, seed: string, compact = false) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: PAPER,
        padding: '72px 80px',
      }}
    >
      {rules(seed).map((rule, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: rule.insetInlineStart,
            width: rule.width,
            background: INK,
            opacity: rule.opacity,
          }}
        />
      ))}

      <div style={{ display: 'flex', flex: 1, gap: 30, alignItems: 'stretch' }}>
        {/* At a 128px thumbnail this canvas is rendered about nine times down,
            which puts the type below four pixels — it reads as smudges, which is
            worse than an empty tile. So the compact size drops the text entirely
            and keeps only what survives the reduction: the gold marker and the
            slug-derived rules. Same brand, legible at both ends. */}
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
            <RtlText text={kicker} style={{ fontSize: 34, color: 'rgba(26,26,26,0.55)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <RtlText text={site.name} style={{ fontSize: 40, color: INK }} />
              {/* Latin, so it must NOT go through RtlText */}
              <div style={{ fontSize: 22, color: 'rgba(26,26,26,0.45)', marginTop: 8 }}>
                {site.nameLatin}
              </div>
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
