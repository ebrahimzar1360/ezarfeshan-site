import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { nav } from '@/lib/site'

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
 * Copy is DESIGN-PLAN §9: what happened, and where to go instead.
 */
export const metadata: Metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <Container className="py-20 md:py-32">
          <SectionHead
            as="h1"
            eyebrow="۴۰۴"
            title="این صفحه وجود ندارد"
            lead="شاید نشانی اشتباه تایپ شده، یا نوشته‌ای که دنبالش بودی جابه‌جا شده."
          />

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button href="/articles">همهٔ مقالات</Button>
            <Button href="/" variant="text">
              صفحهٔ اصلی
            </Button>
          </div>

          <nav aria-label="بخش‌های سایت" className="mt-14 border-t border-border pt-8">
            <p className="text-200 text-text-subtle">یا از اینجا شروع کن:</p>
            <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </main>
      <Footer />
    </>
  )
}
