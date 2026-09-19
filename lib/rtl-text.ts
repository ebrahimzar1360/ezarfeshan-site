/** Zero-width non-joiner — نیم‌فاصله. Ubiquitous in Persian compound words. */
const ZWNJ = '\u200c'

/**
 * Undo Satori's reordering *inside* a word, for the OG image route.
 *
 * Satori has no bidi algorithm. `app/api/og/route.tsx` already works around that
 * at the word level by laying each word out as its own flex item in a
 * row-reverse container. But a ZWNJ starts a new shaping run, and Satori places
 * those runs left to right within a single span — so "سیستم‌سازی" came out as
 * "سازی‌سیستم", with its halves swapped and the word unreadable.
 *
 * This is not new to the cover art: the Open Graph card has rendered every
 * ZWNJ-bearing title that way since it was built, and نیم‌فاصله appears in most
 * Persian compound words, so most article titles were affected on every social
 * card the site produced. The tagline it was tested against — "سیستم بساز، آزاد
 * باش" — happens to contain none, which is why nobody caught it.
 *
 * Reversing the segments before handing them over means Satori's flip lands them
 * in the right order, and the ZWNJ survives so the letterforms stay unjoined as
 * they should be. Same shape of workaround as the row-reverse one, a level down.
 *
 * Lives in lib/ rather than beside the route so `npm test` collects it —
 * vitest only picks up lib/**\/*.test.ts — and because a pure string function
 * has no business inside a request handler.
 *
 * If Satori ever gains a bidi algorithm, this and the row-reverse container come
 * out together. The test is whether a fresh render still reads correctly without
 * them.
 */
export function zwnjSafe(word: string): string {
  if (!word.includes(ZWNJ)) return word
  return word.split(ZWNJ).reverse().join(ZWNJ)
}
