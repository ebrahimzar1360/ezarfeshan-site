/**
 * Which destinations an editor may type into a link field.
 *
 * Content is rendered into href attributes, so `javascript:` and `data:` must
 * never get through — React warns about javascript: URLs but still renders
 * them in some paths. Anything not on this list is rejected at save time.
 */
export function isSafeHref(href: string): boolean {
  const v = href.trim()
  if (!v) return false
  if (/^\/(?!\/)/.test(v)) return true // internal path, not protocol-relative //host
  if (v.startsWith('#')) return true
  if (/^https?:\/\/[^\s]+$/i.test(v)) return true
  if (/^mailto:[^\s]+$/i.test(v)) return true
  if (/^tel:\+?[0-9\-() ]+$/i.test(v)) return true
  return false
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/** Image sources: our own paths only. Remote images would bypass next/image's allowlist. */
export function isSafeImageSrc(src: string): boolean {
  return /^\/(?!\/)[^\s"'<>]*$/.test(src.trim())
}
