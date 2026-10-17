/**
 * The pre-rendered 3D illustrations in public/renders/ (made by
 * tools/render/render.mjs) and which picture goes where. Used on the homepage
 * only: the article pages keep their generated covers.
 *
 * An article with an uploaded cover keeps it. Otherwise its first topic picks
 * one of that topic's two renders, by a hash of the slug, and two articles of
 * the same topic shown together never get the same one.
 */

/** topics that have a pair of renders: cover-<slug>-0.webp and -1.webp */
const COVER_TOPICS = new Set(['management', 'system-building', 'ai', 'business', 'team', 'personal-growth'])
const VARIANTS = 2

/** mocks that have a render: project-<mock>.webp */
const PROJECT_MOCKS = new Set(['performance', 'tama', 'intelligence'])

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

type CoverInput = { slug: string; coverImage: string | null; topics: { slug: string }[] }

/** slug → render URL, for the articles that should show one */
export function renderedCovers(articles: CoverInput[]): Map<string, string> {
  const out = new Map<string, string>()
  const used = new Map<string, Set<number>>()
  for (const a of articles) {
    if (a.coverImage) continue
    const topic = a.topics.find((t) => COVER_TOPICS.has(t.slug))?.slug
    if (!topic) continue
    const taken = used.get(topic) ?? new Set<number>()
    let v = hash(a.slug) % VARIANTS
    for (let k = 0; k < VARIANTS && taken.has(v); k++) v = (v + 1) % VARIANTS
    taken.add(v)
    used.set(topic, taken)
    out.set(a.slug, `/renders/cover-${topic}-${v}.webp`)
  }
  return out
}

/** the 3D render standing in for a project without a screenshot, if its mock has one */
export function projectRender(mock: string): string | null {
  return PROJECT_MOCKS.has(mock) ? `/renders/project-${mock}.webp` : null
}
