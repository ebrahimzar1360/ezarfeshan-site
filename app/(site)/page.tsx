import type { CSSProperties } from 'react'
import { AboutBrief } from '@/components/site/AboutBrief'
import { Diagnosis } from '@/components/site/Diagnosis'
import { FinalInvitation } from '@/components/site/FinalInvitation'
import { Hero } from '@/components/site/Hero'
import { HowIWork } from '@/components/site/HowIWork'
import { FieldExample } from '@/components/site/home/FieldExample'
import { Pillars } from '@/components/site/home/Pillars'
import { Ribbon } from '@/components/site/home/Ribbon'
import { ArticleCard, ArticleListItem } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { getFeaturedArticle, getPublishedArticles, getTopics } from '@/lib/content/queries'

/**
 * The homepage is a story in the order the brand argues it:
 *
 *   hero (the thesis, the 3D system) → ribbon (the subjects) → diagnosis (the
 *   pain, chaos snapping into order) → four pillars (what a system is made of)
 *   → about (who says so, and from where) → field example (one thing built) →
 *   articles (the proof, in writing) → how I work → newsletter.
 *
 * Two blocks the brief specifies are still absent, for the same reason as
 * before: no trust data (logos, client figures) and no free resource exist yet.
 * Tracked in docs/OPEN-QUESTIONS.md.
 */
export const revalidate = 3600

export default async function HomePage() {
  const [featured, recent, topics] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(4),
    getTopics(),
  ])
  const withArticles = topics
    .filter((t) => t._count.articles > 0)
    .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }))
  // the featured article leads; the list beside it must not repeat it
  const rest = recent.filter((a) => a.slug !== featured?.slug).slice(0, 3)

  return (
    <>
      <Hero />
      <Ribbon />
      <Diagnosis />
      <Pillars />
      <AboutBrief />
      <FieldExample />

      <section className="py-24 md:py-36">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="مقالات"
              title="آخرین نوشته‌ها"
              lead="قلب این سایت. هر نوشته یک مسئلهٔ عملیاتی را می‌گیرد و تا انتها می‌برد."
            />
            <div className="mb-10 md:mb-14">
              <Button href="/articles" variant="outline">
                همهٔ مقالات
              </Button>
            </div>
          </div>

          {featured ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
              <div data-reveal>
                {/* priority: this is the LCP element here and nowhere else */}
                <ArticleCard article={featured} priority />
              </div>
              <div data-reveal style={{ '--d': 1 } as CSSProperties}>
                {rest.map((article, i) => (
                  <ArticleListItem key={article.slug} article={article} index={i + 1} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="هنوز مقاله‌ای منتشر نشده"
              body="اولین نوشته‌ها به‌زودی اینجا می‌آیند."
              action={{ label: 'دربارهٔ من', href: '/about' }}
            />
          )}

          {/* Topics as navigation, below the list: the articles are what the
              visitor came for. Same chips as /articles. */}
          <div className="mt-14 border-t border-border pt-8">
            <p className="mb-4 text-200 font-medium text-text-subtle">مرور بر اساس موضوع</p>
            <TopicChips topics={withArticles} current={false} />
          </div>
        </Container>
      </section>

      <HowIWork />
      <FinalInvitation />
    </>
  )
}
