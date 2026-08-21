/**
 * Number and date formatting.
 *
 * Grouping is off everywhere: every number the site formats is a year, a
 * duration, or a small count, and the fa-IR default renders 1380 as ۱٬۳۸۰.
 */

export function faNum(n: number): string {
  return n.toLocaleString('fa-IR', { useGrouping: false })
}

const JALALI_DATE = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(d: Date | string): string {
  return JALALI_DATE.format(typeof d === 'string' ? new Date(d) : d)
}
