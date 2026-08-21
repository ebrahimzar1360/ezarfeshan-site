import Link from 'next/link'
import { site } from '@/lib/site'
import { MARK_RING } from './logo-mark.generated'

/**
 * Header lockup: mark + name + role.
 *
 * The mark string comes from tools/logo/build-logo.js — never hand-copied. Path
 * data is normalised to a 1000-unit em and the transforms depend on that; a
 * copy taken from a 100-unit extraction once rendered the letters at a tenth of
 * their size, which read as an empty ring.
 *
 * The ring variant is the real mark - the aperture and gold bead are what make
 * it recognisable - and it holds up at the 44px header size. The solid disc is
 * kept for favicons, where 16-32px leaves no room for an outline.
 */
export function Logo({ showRole = true }: { showRole?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 text-text no-underline"
      aria-label={`${site.name} — صفحهٔ اصلی`}
    >
      <span
        aria-hidden
        className="block size-11 shrink-0 [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: MARK_RING }}
      />
      <span className="flex flex-col leading-none">
        <span className="text-500 font-bold">{site.name}</span>
        {showRole && (
          // hidden on small screens: wrapped onto two lines it doubled the header height
          <span className="mt-1.5 hidden text-200 font-medium text-text-subtle sm:block">
            {site.role}
          </span>
        )}
      </span>
    </Link>
  )
}
