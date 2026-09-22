import { cn } from '@/lib/utils'

/**
 * The site's icon set.
 *
 * Hand-rolled rather than `lucide-react`, which would be ~6–9 kB gzip for the
 * dozen shapes used here plus a dependency to keep current. The deciding
 * argument is not the bytes, it is control over three things a third-party set
 * cannot decide for us:
 *
 * - `stroke-width: 1.75`. Lucide ships 2, which reads heavy beside Vazirmatn's
 *   700 weight.
 * - `width: 1em`. Icons scale with whatever type token the surrounding control
 *   uses, instead of being pinned to a `size-4` that only matches one button.
 * - Mirroring. Whether a glyph flips under dir="rtl" is a per-icon judgement,
 *   and getting it wrong is worse than not having the icon.
 *
 * Path data is copied from Lucide (ISC licence, which permits this):
 * https://github.com/lucide-icons/lucide — © Lucide Contributors.
 */

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  chat: (
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  ),
  send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  alert: (
    <>
      <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  copy: (
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  ),
  chevron: <path d="m15 18-6-6 6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  external: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.3 17.7-1.4 1.4" />
      <path d="m19.1 4.9-1.4 1.4" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />,
  system: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </>
  ),
} as const

export type IconName = keyof typeof PATHS

/**
 * Icons that point somewhere and must therefore mirror under dir="rtl". The
 * flip is done in CSS via `[data-flip]:dir(rtl)` in globals.css.
 *
 * Everything else stays put, and some of those are counter-intuitive:
 * `search` does not flip — a magnifier's handle sits bottom-right in Persian
 * interfaces as in Latin ones — and neither would play/pause, which is the
 * mistake people make most often.
 */
const DIRECTIONAL = new Set<IconName>(['chevron', 'external'])

export function Icon({
  name,
  className = '',
  label,
}: {
  name: IconName
  className?: string
  /**
   * Only for an icon that is the *entire* content of a control. When the control
   * already has a visible label or its own aria-label, leave this off so the
   * name is not announced twice.
   */
  label?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('inline-block shrink-0', className)}
      {...(DIRECTIONAL.has(name) ? { 'data-flip': '' } : {})}
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true, focusable: false })}
    >
      {PATHS[name]}
    </svg>
  )
}
