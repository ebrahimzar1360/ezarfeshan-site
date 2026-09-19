import type { ArticleCardData } from './queries'

/**
 * The image to show for an article.
 *
 * `Article.coverImage` has existed in the schema, the card query and the admin
 * editor since the content phase; nothing ever rendered it, and all six seeded
 * articles leave it empty. So the real question is what to do when it is blank,
 * and the answer is a generated cover rather than a gap: a list of bare
 * headings is the wall of text this overhaul is meant to break up.
 *
 * Generated covers carry no information the adjacent heading does not, so they
 * are decorative and take `alt=""`. A real uploaded cover might, but the schema
 * has no alt column — until it does, the title stands in. Recorded as debt in
 * docs/OPEN-QUESTIONS.md.
 */
export function coverUrl(
  article: Pick<ArticleCardData, 'slug' | 'coverImage' | 'topics'>,
  /**
   * Set for a thumbnail. A cover rendered at 1200px wide and displayed at 128
   * puts its type under four pixels, where it reads as smudges — so the compact
   * form drops the text and keeps the gold marker and the rules, which survive
   * the reduction.
   */
  size: 'full' | 'thumb' = 'full'
): string {
  if (article.coverImage) return article.coverImage

  const kicker = article.topics[0]?.name ?? ''
  const params = new URLSearchParams({ variant: 'cover', seed: article.slug })
  if (kicker) params.set('kicker', kicker)
  if (size === 'thumb') params.set('compact', '1')
  return `/api/og?${params}`
}

export function coverAlt(article: Pick<ArticleCardData, 'title' | 'coverImage'>): string {
  return article.coverImage ? article.title : ''
}

/** 3:2, matching the cover branch of app/api/og/route.tsx. */
export const COVER_RATIO = { width: 1200, height: 800 }
