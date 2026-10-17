/**
 * Date arithmetic for the biography.
 *
 * Durations are derived from the start year at render time, never written as a
 * literal. A hardcoded "۲۵ سال" silently becomes wrong next Nowruz; this does not.
 *
 * The biography itself (supplied by Ebrahim, 1405/05/30 — milestones, roles,
 * credentials, the field example) moved to the CMS: its defaults are in
 * lib/cms/registry.ts (about.*), and the page, JSON-LD and chatbot all read the
 * same sections. Nothing there is inferred; where a detail was not given —
 * client names, revenue, team sizes — there is no entry.
 */

/** Current year in the Persian calendar. */
export function currentJalaliYear(): number {
  return Number(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' })
      .format(new Date())
      .replace(/\D/g, '')
  )
}

export function yearsSince(startJalali: number): number {
  return currentJalaliYear() - startJalali
}

/**
 * Persian digits, for narrative copy. Data and code keep Latin numerals.
 *
 * Grouping is off: every number this formats is a year or a count of years, and
 * the default locale grouping renders 1380 as ۱٬۳۸۰.
 */
export function fa(n: number): string {
  return n.toLocaleString('fa-IR', { useGrouping: false })
}
