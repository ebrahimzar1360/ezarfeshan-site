'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * One IntersectionObserver for the whole public site.
 *
 * Any element with `data-reveal` (or the `.chaos`, `.rail-x`, `.draw` blocks,
 * which also carry it) gets `data-shown` the first time it is a sixth of the way
 * into the viewport, and is then unobserved — reveals happen once, they do not
 * replay on every scroll past.
 *
 * An attribute rather than a class, on purpose. The page segment streams in
 * and may hydrate after this effect runs; adding to `className` on a
 * not-yet-hydrated element is a hydration mismatch, and any later re-render of
 * that element would reset the class and hide it again. React never touches an
 * attribute that is not one of its props, so `data-shown` survives both.
 *
 * Hiding is CSS-only and gated on `html.js` (set by the inline theme script),
 * so without JavaScript nothing is ever hidden in the first place. Re-scans on
 * navigation because the App Router swaps page content without a reload.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown])')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-shown', ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-shown', '')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
