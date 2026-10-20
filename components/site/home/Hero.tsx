import Image from 'next/image'
import type { CSSProperties } from 'react'
import { Inline } from '@/components/cms/Inline'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { PAGE_PHOTOS } from '@/lib/content/photos'
import { HeroArt } from './HeroArt'

const rise = (s: number) => ({ '--dl': `${s}s` }) as CSSProperties

/**
 * Hero — a full-width photograph (home-hero from the image pack, chosen by
 * the owner 1405/07/28 over the 3D monogram) under a forest wash, the copy in
 * real text on top. The picture runs from piled paper to a calm dashboard; it
 * is mirrored so that, read right to left like the headline, it goes from the
 * chaos under the copy to the order beside it.
 *
 * The wash is darkest on the reading side and at the foot on small screens,
 * where the copy covers the whole picture. On it the accent is gold-light
 * (allowed on forest) and the button is the gold variant.
 *
 * Opposite the copy stands the 3D monogram (HeroArt → HeroStage), as before
 * the photograph arrived (owner, 1405/07/28): the picture is the ground, the
 * mark is the figure. Copy comes from the CMS (home.hero).
 */
export async function Hero() {
  const hero = await getSection('home.hero')
  const photo = PAGE_PHOTOS.home

  return (
    <section className="tone-inverse relative isolate overflow-hidden bg-forest-deep">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 -scale-x-100 object-cover object-[85%_center]"
      />
      <span aria-hidden className="photo-scrim absolute inset-0 -z-10" />

      <Container className="grid min-h-[clamp(32rem,78svh,44rem)] items-center gap-8 pb-14 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-20">
        <div className="max-w-[36rem]">
          <h1 className="text-[clamp(2.2rem,3.5vw,3.3rem)] font-black leading-[1.3] tracking-tight text-paper">
            <span className="hero-rise block" style={rise(0.05)}>
              <Inline text={hero.line1} accentClass="ink-sweep text-gold-light" />
            </span>
            {hero.line2 && (
              <span className="hero-rise block" style={rise(0.2)}>
                <Inline text={hero.line2} accentClass="ink-sweep text-gold-light" />
              </span>
            )}
          </h1>

          {hero.lead && (
            <p
              className="hero-rise mt-6 max-w-[30rem] text-500 leading-normal text-paper/85"
              style={rise(0.4)}
            >
              <Inline text={hero.lead} />
            </p>
          )}

          {hero.button.label && (
            <div className="hero-rise mt-9" style={rise(0.6)}>
              <Button href={hero.button.href} variant="gold" size="lg">
                {hero.button.label}
                <Icon name="arrow" />
              </Button>
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-[26rem] lg:max-w-none">
          <HeroArt />
        </div>
      </Container>
    </section>
  )
}
