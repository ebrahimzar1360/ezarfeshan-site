import type { CSSProperties } from 'react'
import { ArticleTile } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import type { ArticleCardData } from '@/lib/content/queries'
import { renderedCovers } from '@/lib/content/renders'
import { Tilt } from '@/components/ui/Tilt'

/**
 * "یادداشت‌ها و تجربه‌ها" on the homepage: the heading, one line, and the latest
 * pieces, each with a 3D illustration of its topic (lib/content/renders.ts)
 * and a slight tilt towards the mouse. With nothing published yet it shows a
 * quiet empty card rather than filler. Copy: CMS home.articles.
 */
export async function ArticlesPreview({ articles }: { articles: ArticleCardData[] }) {
  const s = await getSection('home.articles')
  const covers = renderedCovers(articles)

  return (
    <section className="bg-bg-band py-16 md:py-24">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14" data-reveal>
          <div>
            <h2 className="text-700 font-extrabold md:text-800">{s.title}</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            {s.lead && (
              <p className="mt-5 max-w-[34rem] text-400 leading-normal text-text-muted">{s.lead}</p>
            )}
          </div>
          {s.button.label && (
            <Button href={s.button.href} variant="outline">
              {s.button.label}
              <Icon name="arrow" />
            </Button>
          )}
        </header>

        {articles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {articles.map((a, i) => (
              <div key={a.slug} data-reveal style={{ '--d': i } as CSSProperties}>
                <Tilt>
                  <ArticleTile article={a} cover={covers.get(a.slug)} />
                </Tilt>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-v3 px-6 py-14 text-center" data-reveal>
            <p className="text-500 font-bold">{s.emptyTitle}</p>
            {s.emptyText && (
              <p className="mx-auto mt-3 max-w-md text-300 leading-normal text-text-muted">{s.emptyText}</p>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}
