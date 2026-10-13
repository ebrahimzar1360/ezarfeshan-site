'use client'

import { useEffect } from 'react'

/**
 * Marks `<body data-past-hero>` once the hero has scrolled under the header.
 *
 * The header's consult button hides while the hero is on screen — the hero
 * has its own, larger one — and slides in once the visitor has scrolled past.
 * globals.css does the hiding; this only flips the attribute. Without JS the
 * attribute never appears, so on the homepage the header button stays hidden
 * and the hero's own strip is the way in.
 */
export function HeroWatch() {
  useEffect(() => {
    const hero = document.querySelector('[data-hero]')
    if (!hero) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        if (e.isIntersecting) delete document.body.dataset.pastHero
        else document.body.dataset.pastHero = ''
      },
      // the sticky header is 5rem tall: the hero counts as gone once its
      // bottom edge passes under it
      { rootMargin: '-80px 0px 0px 0px' },
    )
    io.observe(hero)
    return () => {
      io.disconnect()
      delete document.body.dataset.pastHero
    }
  }, [])
  return null
}
