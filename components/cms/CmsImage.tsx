import Image from 'next/image'
import type { ImageValue } from '@/lib/cms/fields'
import { isSafeImageSrc } from '@/lib/cms/url'

/**
 * An image chosen in the CMS. Library images carry their dimensions, so they
 * go through next/image (responsive sizes, AVIF/WebP, no layout shift). A path
 * typed by hand without dimensions still renders, as a plain lazy <img>.
 */
export function CmsImage({
  image,
  sizes,
  className,
  priority,
}: {
  image: ImageValue
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (!image.src || !isSafeImageSrc(image.src)) return null
  if (image.width && image.height) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    )
  }
  // eslint-disable-next-line @next/next/no-img-element -- no dimensions to give next/image
  return <img src={image.src} alt={image.alt} loading={priority ? 'eager' : 'lazy'} className={className} />
}
