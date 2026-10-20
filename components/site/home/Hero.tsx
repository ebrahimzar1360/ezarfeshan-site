import Image from 'next/image'
import type { CSSProperties } from 'react'
import { Inline } from '@/components/cms/Inline'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { PAGE_PHOTOS } from '@/lib/content/photos'
import { HeroParallax } from './HeroParallax'

const rise = (s: number) => ({ '--dl': `${s}s` }) as CSSProperties

/**
 * Motes of gold dust drifting up through the window light: x position (from
 * the reading end), size, duration, delay and sideways drift. Fixed values, so
 * the server and the client draw the same thing.
 */
const MOTES = [
  [8, 5, 13, 0, 24], [14, 3, 11, 3.5, -18], [20, 6, 16, 1.2, 30], [26, 3, 12, 6, -12],
  [31, 4, 14, 2.4, 20], [37, 2, 10, 8, -26], [43, 5, 17, 4.6, 16], [12, 2, 9, 9.5, 10],
  [18, 4, 15, 11, -22], [34, 3, 13, 12.5, 28], [46, 2, 11, 7, -14], [5, 3, 14, 5.2, 18],
] as const

/**
 * Hero (owner, 1405/07/28): the photograph alone, made to hold the eye from the
 * first second — no 3D here; the 3D mark closes the page instead (home CTA).
 *
 * The picture (home-hero, mirrored so that, read right to left like the
 * headline, it goes from the piled paper under the copy to the calm dashboard
 * beside it) arrives out of a soft blur and settles, then drifts very slowly.
 * A band of gold light crosses it now and then, dust motes rise through the
 * window light, and on a desktop it leans a few pixels away from the pointer.
 * All of it is CSS (.hp-* in globals.css) and all of it stops under reduced
 * motion; the copy rises in once, as before.
 *
 * Copy comes from the CMS (home.hero) as real text over .photo-scrim.
 */
export async function Hero() {
  const hero = await getSection('home.hero')
  const photo = PAGE_PHOTOS.home

  return (
    <HeroParallax className="tone-inverse relative isolate overflow-hidden bg-forest-deep">
      <div className="hp-media -z-10">
        <div className="hp-mirror">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="hp-photo object-cover object-[85%_center]"
          />
        </div>
      </div>
      <span aria-hidden className="hp-sweep -z-10" />
      <span aria-hidden className="hp-motes -z-10">
        {MOTES.map(([x, s, t, d, dx], i) => (
          <span
            key={i}
            className="hp-mote"
            style={{ '--x': `${x}%`, '--s': `${s}px`, '--t': `${t}s`, '--d': `${d}s`, '--dx': `${dx}px` } as CSSProperties}
          />
        ))}
      </span>
      <span aria-hidden className="photo-scrim absolute inset-0 -z-10" />
      <span aria-hidden className="hp-vignette -z-10" />

      <Container className="flex min-h-[clamp(34rem,86svh,50rem)] items-end pb-20 pt-24 md:items-center md:py-28">
        <div className="max-w-[38rem]">
          <span aria-hidden className="hero-rise hp-rule" style={rise(0)} />
          <h1 className="mt-6 text-[clamp(2.3rem,4vw,3.6rem)] font-black leading-[1.3] text-paper">
            <span className="hero-rise block" style={rise(0.15)}>
              <Inline text={hero.line1} accentClass="ink-sweep text-gold-light" />
            </span>
            {hero.line2 && (
              <span className="hero-rise block" style={rise(0.3)}>
                <Inline text={hero.line2} accentClass="ink-sweep text-gold-light" />
              </span>
            )}
          </h1>

          {hero.lead && (
            <p className="hero-rise mt-6 max-w-[30rem] text-500 leading-normal text-paper/85" style={rise(0.5)}>
              <Inline text={hero.lead} />
            </p>
          )}

          {hero.button.label && (
            <div className="hero-rise mt-9" style={rise(0.7)}>
              <Button href={hero.button.href} variant="gold" size="lg">
                {hero.button.label}
                <Icon name="arrow" />
              </Button>
            </div>
          )}
        </div>
      </Container>

      <span aria-hidden className="hp-cue" />
    </HeroParallax>
  )
}
