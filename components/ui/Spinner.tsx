/**
 * Busy indicator for a control that is waiting on the network.
 *
 * Rotation is the one motion that needs no RTL thought: a spin has no start and
 * no end edge. Sized in `em` so it tracks whatever type token the surrounding
 * control uses, rather than pinning itself to a pixel size that only matches one
 * button height.
 *
 * It carries no role and no label on purpose. The consumer already has the live
 * region — Button keeps its accessible name and adds aria-busy, forms have their
 * own role="status" — and a second announcement here would make Playwright's
 * strict-mode getByRole('status') match twice. See docs/UX-OVERHAUL.md §5.
 */

import { cn } from '@/lib/utils'

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={cn('spin shrink-0', className)}
    >
      {/* the track, then a quarter arc over it: the gap is what reads as motion */}
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}
