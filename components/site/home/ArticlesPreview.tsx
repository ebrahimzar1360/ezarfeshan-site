import type { CSSProperties } from 'react'
import { ArticleTile } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { ArticleCardData } from '@/lib/content/queries'

/**
 * "یادداشت‌ها و تجربه‌ها" on the homepage: the heading, one line, and the latest
 * three pieces. With nothing published yet it shows a quiet empty card rather
 * than filler.
 */
export function ArticlesPreview({ articles }: { articles: ArticleCardData[] }) {
  return (
    <section className="bg-bg-band py-16 md:py-24">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14" data-reveal>
          <div>
            <h2 className="text-700 font-extrabold md:text-800">یادداشت‌ها و تجربه‌ها</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            <p className="mt-5 max-w-[34rem] text-400 leading-normal text-text-muted">
              مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها
            </p>
          </div>
          <Button href="/articles" variant="outline">
            همهٔ یادداشت‌ها
            <Icon name="arrow" />
          </Button>
        </header>

        {articles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {articles.map((a, i) => (
              <div key={a.slug} data-reveal style={{ '--d': i } as CSSProperties}>
                <ArticleTile article={a} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-v3 px-6 py-14 text-center" data-reveal>
            <p className="text-500 font-bold">اولین یادداشت‌ها به‌زودی منتشر می‌شوند</p>
            <p className="mx-auto mt-3 max-w-md text-300 leading-normal text-text-muted">
              تا آن زمان می‌توانید از مسیر کاری من و پروژه‌های در حال توسعه دیدن کنید.
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}
