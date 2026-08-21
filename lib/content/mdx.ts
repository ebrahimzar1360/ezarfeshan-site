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

const HTML_COMMENT = /<!--[\s\S]*?-->/g

export const DRAFT_MARKER = 'DRAFT: نمونه'

export function hasDraftMarker(body: string): boolean {
  return body.includes(DRAFT_MARKER)
}

export function prepareMdx(body: string): string {
  return body.replace(HTML_COMMENT, '').trimStart()
}
