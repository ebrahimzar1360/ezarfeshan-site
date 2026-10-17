import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { RevealObserver } from '@/components/site/RevealObserver'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { getSection } from '@/lib/cms/content'
import { getMainNav } from '@/lib/cms/site'

/**
 * The only not-found file in the app, and that is deliberate.
 *
 * A second one at app/(site)/not-found.tsx looked right — it would have kept the
 * site layout automatically — but route groups are transparent to the router, so
 * both files sit at the same routing level and Next cannot tell which is the
 * root fallback. Measured: with both present, an unmatched path rendered the
 * root file while `notFound()` from articles/[slug] answered 404 with an **empty
 * body**. With either one alone, every case renders. So: one file, and it brings
 * its own chrome, because a dead end that strips the navigation is a worse dead
 * end.
 *
 * Header and Footer are imported rather than inherited, since the root layout
 * carries neither (the admin panel shares it — see OPEN-QUESTIONS §13). The cost
 * is that a missing article *inside the admin panel* also renders public chrome.
 * That path is authenticated and rare — every other /admin/* miss is caught by
 * middleware and redirected to the login page — and it is a fair trade for every
 * visitor getting a way out.
 *
 * Copy is DESIGN-PLAN §9: what happened, and where to go instead. The words
 * themselves are the CMS's (misc.notFound).
 */
export const metadata: Metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const [copy, nav] = await Promise.all([getSection('misc.notFound'), getMainNav()])
  return (
    <>
      <RevealObserver />
      <Header />
      <main id="main" className="flex-1">
        <section className="bp-grid relative overflow-hidden bg-bg-band">
          <Container className="grid items-center gap-12 py-20 md:grid-cols-[1.2fr_1fr] md:py-32">
            <div>
              <SectionHead
                as="h1"
                eyebrow={copy.eyebrow}
                title={copy.title}
                lead={copy.lead}
              />

              <div className="flex flex-wrap items-center gap-3">
                {copy.primary.label && (
                  <Button href={copy.primary.href} size="lg">
                    {copy.primary.label}
                  </Button>
                )}
                {copy.secondary.label && (
                  <Button href={copy.secondary.href} size="lg" variant="outline">
                    {copy.secondary.label}
                  </Button>
                )}
              </div>

              <nav aria-label="بخش‌های سایت" className="mt-14 border-t border-border pt-8">
                <p className="text-200 text-text-subtle">{copy.navIntro}</p>
                <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
                  {nav.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-300">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* The hero's four layers, knocked loose: a page that is not where
                it should be. */}
            <svg aria-hidden viewBox="0 0 300 260" className="mx-auto w-full max-w-sm" fill="none" strokeWidth="1.5">
              {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${[20, -18, 26, -8][i]} ${200 - i * 52}) rotate(${[-6, 9, -12, 18][i]} 150 0)`}>
                  <path d="M150 0 260 -40 150 -80 40 -40Z" className={i === 3 ? 'fill-accent/80 text-accent' : 'fill-bg-raised text-border-strong'} stroke="currentColor" />
                  <path d="M40 -40v16l110 40 110-40v-16" className="text-border-strong" stroke="currentColor" />
                </g>
              ))}
            </svg>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
