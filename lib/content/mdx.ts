/**
 * MDX treats `<!-- ... -->` as JSX, not a comment, and fails to compile. Article
 * bodies are authored as Markdown — by the seed today and by the admin editor
 * later — so HTML comments have to be stripped before compilation rather than
 * banned from the editor.
 *
 * The DRAFT marker is detected before stripping, so it survives as a rendered
 * notice while disappearing from the body. That keeps the exact marker the brief
 * asked for in the database.
 */

import GithubSlugger from 'github-slugger'

const HTML_COMMENT = /<!--[\s\S]*?-->/g

/** Fenced code blocks, so a `## ` inside one is not mistaken for a heading. */
const FENCED_CODE = /^```[\s\S]*?^```/gm

/** ATX headings at depth 2 and 3. Deeper ones do not earn a place in the TOC. */
const HEADING = /^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm

export const DRAFT_MARKER = 'DRAFT: نمونه'

export function hasDraftMarker(body: string): boolean {
  return body.includes(DRAFT_MARKER)
}

export function prepareMdx(body: string): string {
  return body.replace(HTML_COMMENT, '').trimStart()
}

export type Heading = { depth: 2 | 3; text: string; id: string }

/**
 * The h2/h3 outline of an article body, for the table of contents and for the
 * anchor links on the headings themselves.
 *
 * Runs on the *prepared* source, after HTML comments are stripped, so a heading
 * inside a commented-out block never reaches the contents list. Fenced code is
 * blanked first for the same reason: a shell snippet containing `## note` is not
 * a section.
 *
 * The slugger is constructed per call, never module-level. github-slugger keeps
 * its collision counter on the instance, so a shared one would number the second
 * article's "مقدمه" as `مقدمه-1` purely because an earlier article had one —
 * the classic bug with this library, and it produces links that work in
 * development and break in production where render order differs.
 *
 * `components/ui/mdx.tsx` walks the same headings in the same order with its own
 * fresh slugger, so the two agree without passing state between them.
 */
export function extractHeadings(body: string): Heading[] {
  const source = prepareMdx(body).replace(FENCED_CODE, '')
  const slugger = new GithubSlugger()
  const headings: Heading[] = []

  for (const match of source.matchAll(HEADING)) {
    const hashes = match[1]
    const text = match[2]?.trim()
    if (!hashes || !text) continue
    headings.push({
      depth: hashes.length === 2 ? 2 : 3,
      text,
      id: slugger.slug(text),
    })
  }

  return headings
}

/**
 * Slugger for the render side. Separate function rather than a shared instance
 * so each render starts its counter at zero — see extractHeadings.
 */
export function createSlugger(): GithubSlugger {
  return new GithubSlugger()
}
