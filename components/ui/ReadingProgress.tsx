/**
 * The signature element: the gold bar recovered from the printed brand guide,
 * here running down the inline-start edge of the article column and filling as
 * the reader scrolls. See docs/DESIGN-PLAN.md §6.
 *
 * Pure CSS via `animation-timeline: view()` — no scroll listener, no client
 * component, zero JavaScript. Browsers without scroll-driven animations get a
 * static rail; nothing breaks and nothing is missing.
 *
 * A horizontal bar pinned to the top of the viewport is the usual solution and
 * is exactly the cliché the brief rules out. This does the same job with the
 * brand's own device.
 */
export function ReadingProgress() {
  return <span aria-hidden className="reading-rail" />
}
