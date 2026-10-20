import Image from 'next/image'
import Link from 'next/link'

/**
 * Header / footer lockup, as the brand sheet v4 sets it: the EZ monogram, a
 * thin gold rule, then the name as live text, the Latin name in spaced
 * capitals and the subline ("Management × AI") with its × in gold.
 *
 * The monogram is a raster cut from that sheet (tools/logo/crop-sheet.mjs). The
 * `light` tone swaps in the variant whose emerald pieces are ivory, for the
 * dark footer. The × is a mark, not reading text: on the light ground it takes
 * the dark gold stop (3.23:1, above the 3:1 for graphics), never Warm Gold.
 */
export function Logo({
  tone = 'default',
  name,
  nameLatin,
  subline,
}: {
  tone?: 'default' | 'light'
  name: string
  nameLatin: string
  subline?: string
}) {
  const light = tone === 'light'
  const [before, after] = subline?.includes('×') ? subline.split('×', 2) : [subline, undefined]
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 no-underline ${light ? 'text-paper hover:text-paper' : 'text-text'}`}
      aria-label={`${name} — صفحهٔ اصلی`}
    >
      <Image
        src={light ? '/brand/ez-monogram-light.webp' : '/brand/ez-monogram.webp'}
        alt=""
        width={640}
        height={621}
        sizes="48px"
        priority
        className="h-11 w-auto shrink-0"
      />
      <span aria-hidden className="h-10 w-px shrink-0 bg-gold" />
      <span className="flex flex-col leading-none">
        <span className="text-500 font-extrabold">{name}</span>
        <span
          className={`latin mt-1.5 text-[0.62rem] font-medium uppercase tracking-[0.22em] ${light ? 'text-paper/75' : 'text-text-subtle'}`}
        >
          {nameLatin}
        </span>
        {subline && (
          <span
            className={`latin mt-1 hidden text-[0.62rem] tracking-[0.08em] sm:block ${light ? 'text-paper/75' : 'text-text-subtle'}`}
          >
            {before}
            {after !== undefined && (
              <>
                <span className={light ? 'text-gold-light' : 'text-gold-dark'}>×</span>
                {after}
              </>
            )}
          </span>
        )}
      </span>
    </Link>
  )
}
