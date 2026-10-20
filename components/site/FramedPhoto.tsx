import Image from 'next/image'
import type { SitePhoto } from '@/lib/content/photos'

/**
 * A picture from the image pack in the site's one photo frame: plain rounded
 * corners with a gold rule offset behind, as on the homepage's experience
 * photo, at 16:9 — the pack's own ratio, so nothing is cropped.
 *
 * `priority` for a masthead (above the fold, a likely LCP); everything else
 * loads lazily.
 */
export function FramedPhoto({
  photo,
  priority = false,
  sizes = '(min-width: 1024px) 30rem, (min-width: 768px) 42vw, 90vw',
  className = '',
}: {
  photo: SitePhoto
  priority?: boolean
  sizes?: string
  className?: string
}) {
  return (
    <div className={`relative mx-auto w-full max-w-md md:max-w-none ${className}`}>
      <span aria-hidden className="absolute -bottom-3 -end-3 size-full rounded-2xl border-2 border-gold/60" />
      <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_48px_-24px_var(--ink-30)]">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
    </div>
  )
}
