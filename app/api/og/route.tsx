import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { site } from '@/lib/site'

// Node runtime, not edge: the font is read from disk, and it lives outside
// public/ so it is never served to visitors.
export const runtime = 'nodejs'

const INK = '#1A1A1A'
const PAPER = '#F5F5F0'
const GOLD = '#C8A84B'

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
  const words = text.trim().split(/\s+/)
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

export async function GET(request: NextRequest) {
  const rawTitle = request.nextUrl.searchParams.get('title')?.slice(0, 120) || site.tagline
  const rawKicker = request.nextUrl.searchParams.get('kicker')?.slice(0, 60) || site.role

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
      width: 1200,
      height: 630,
      fonts: [{ name: 'Vazirmatn', data: vazirmatn(), weight: 700, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400, immutable' },
    }
  )
}
