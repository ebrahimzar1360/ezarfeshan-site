import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/site'

/**
 * Header / footer lockup: the EZ monogram from the owner's logo sheet, the name
 * as live text, and the Latin line the sheet pairs with it.
 *
 * The monogram is a raster cut from that sheet (tools/logo/crop-sheet.mjs). The
 * `light` tone swaps in the variant whose E is paper-white, for the dark footer.
 */
export function Logo({ tone = 'default' }: { tone?: 'default' | 'light' }) {
  const light = tone === 'light'
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 no-underline ${light ? 'text-paper hover:text-paper' : 'text-text'}`}
      aria-label={`${site.name} — صفحهٔ اصلی`}
    >
      <Image
        src={light ? '/brand/ez-monogram-light.webp' : '/brand/ez-monogram.webp'}
        alt=""
        width={640}
        height={595}
        sizes="48px"
        priority
        className="h-11 w-auto shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className="text-500 font-extrabold">{site.name}</span>
        <span
          className={`latin mt-1.5 text-[0.62rem] font-medium uppercase tracking-[0.2em] ${light ? 'text-paper/70' : 'text-text-subtle'}`}
        >
          {site.nameLatin}
        </span>
        <span
          className={`latin mt-1 hidden text-[0.62rem] tracking-[0.08em] sm:block ${light ? 'text-gold-light' : 'text-text-subtle'}`}
        >
          Management × AI
        </span>
      </span>
    </Link>
  )
}
