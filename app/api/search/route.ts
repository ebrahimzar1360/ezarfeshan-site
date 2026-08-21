import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Persian full-text search.
 *
 * Postgres has no Persian stemmer, so to_tsvector('persian', ...) does not
 * exist and the 'simple' dictionary would only match whole words — useless for
 * a language that glues affixes on. pg_trgm similarity handles that: it matches
 * on shared character trigrams, so a partial or slightly different form of a
 * word still scores.
 *
 * ILIKE is kept alongside it because trigram similarity misses very short
 * queries, where a plain substring match is exactly right.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)

  if (q.length < 2) {
    return Response.json({
      ok: true,
      data: { query: q, results: [] },
      ...(q.length === 1 ? { hint: 'دست‌کم دو حرف بنویس.' } : {}),
    })
  }

  try {
    const rows = await db.$queryRaw<
      { slug: string; title: string; excerpt: string; score: number }[]
    >`
      SELECT slug, title, excerpt,
             GREATEST(
               similarity(title, ${q}),
               similarity(excerpt, ${q}) * 0.6,
               similarity(body, ${q}) * 0.3
             ) AS score
      FROM articles
      WHERE status = 'PUBLISHED'
        AND published_at <= NOW()
        AND (
          title ILIKE ${'%' + q + '%'}
          OR excerpt ILIKE ${'%' + q + '%'}
          OR body ILIKE ${'%' + q + '%'}
          OR similarity(title, ${q}) > 0.2
          OR similarity(excerpt, ${q}) > 0.2
        )
      ORDER BY
        (title ILIKE ${'%' + q + '%'}) DESC,
        score DESC,
        published_at DESC
      LIMIT 20
    `

    return Response.json({
      ok: true,
      data: {
        query: q,
        results: rows.map((r) => ({ slug: r.slug, title: r.title, excerpt: r.excerpt })),
      },
    })
  } catch (cause) {
    console.error('[api:search]', cause)
    return Response.json(
      { ok: false, error: { message: 'جست‌وجو انجام نشد. چند لحظه بعد دوباره تلاش کن.' } },
      { status: 500 }
    )
  }
}
