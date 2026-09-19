'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * One contents link, lit when its section is the one being read.
 *
 * An IntersectionObserver rather than a scroll listener: one observer per link,
 * no throttling to tune, and nothing running between intersections. The
 * rootMargin pins the "current" band to the top of the viewport — a heading
 * counts as current from just under the sticky header down to 30% of the screen,
 * which is where the eye actually is.
 *
 * The lit state is the gold marker's third appearance on the site, after the
 * section rule and the reading rail. Gold as a border, never as the label
 * colour: 2.10:1 on paper, and an e2e test watches for that exact mistake.
 *
 * Renders as a plain link until it hydrates, and stays one if the browser has no
 * IntersectionObserver. Nothing here is required to read the article.
 */
export function TocActiveLink({ id, text }: { id: string; text: string }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const heading = document.getElementById(id)
    if (!heading || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setActive(!!entry?.isIntersecting),
      { rootMargin: '-80px 0px -70% 0px' }
    )
    observer.observe(heading)
    return () => observer.disconnect()
  }, [id])

  return (
    <a
      href={`#${id}`}
      aria-current={active ? 'location' : undefined}
      className={cn(
        'block no-underline transition-colors duration-150',
        active
          ? 'gold-marker font-medium text-text'
          : 'ps-4 text-text-muted hover:text-text'
      )}
    >
      {text}
    </a>
  )
}
