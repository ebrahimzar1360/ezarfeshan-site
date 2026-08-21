import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { site } from '@/lib/site'

/**
 * The tagline behaves as the page's thesis, not decoration — so it is the h1 and
 * nothing competes with it. Deliberately not a centred stack on a gradient:
 * asymmetric, type-led, flat ground.
 *
 * min-height is 72vh rather than 100vh so the next block is visible at the fold.
 * A hero that fills the viewport hides the fact that the site is about reading.
 *
 * The entrance is the one orchestrated motion in the whole site: the gold bar
 * draws down, then the lines settle behind it. `prefers-reduced-motion` removes
 * it outright — see the reduce block in globals.css.
 */
export function Hero() {
  return (
    <Container className="flex min-h-[72vh] flex-col justify-center py-20 md:py-28">
      <div className="relative ps-4 md:ps-6">
        {/* The marker is its own element so it can animate independently of the text.
            Tailwind's logical inset utilities are `inset-y-*` and `start-*`; the
            CSS property names (inset-block, inset-inline-start) are not class names
            and silently produce nothing. */}
        <span
          aria-hidden
          className="enter-bar absolute inset-y-0 start-0 w-1 origin-top rounded-full bg-accent"
        />
        <h1 className="text-800 md:text-900 lg:text-1000">{site.tagline}</h1>
        <p
          className="enter mt-6 max-w-(--container-measure) text-500 text-text-muted"
          style={{ animationDelay: '180ms' }}
        >
          برای مدیرانی که کسب‌وکارشان بدون خودشان از حرکت می‌ایستد.
        </p>
      </div>

      <div
        className="enter mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 ps-4 md:ps-6"
        style={{ animationDelay: '300ms' }}
      >
        <Button href="/articles" size="lg">
          آخرین مقالات
        </Button>
        {/* the second action stays a text link: reading comes before subscribing,
            and subscribing before booking. Two solid buttons would flatten that. */}
        <Button href="/newsletter" variant="text">
          عضویت در خبرنامه
        </Button>
      </div>
    </Container>
  )
}
