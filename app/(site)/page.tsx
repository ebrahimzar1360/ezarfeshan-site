import Link from 'next/link'
import { AboutBrief } from '@/components/site/AboutBrief'
import { Diagnosis } from '@/components/site/Diagnosis'
import { FinalInvitation } from '@/components/site/FinalInvitation'
import { Hero } from '@/components/site/Hero'
import { HowIWork } from '@/components/site/HowIWork'
import { ArticleCard, ArticleListItem } from '@/components/ui/ArticleCard'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { getFeaturedArticle, getPublishedArticles, getTopics } from '@/lib/content/queries'

/**
 * Block order follows the brief. Two blocks it specifies are deliberately absent:
 *
 *  - the trust block (experience, companies, talks, figures) — no real data was
 *    supplied, and the brand rule is that a claim carries a number or it goes.
 *  - the free-resource block — nothing exists to give away yet.
 *
 * Both are tracked in docs/OPEN-QUESTIONS.md. They return when content does.
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
  // the featured article leads; the list below must not repeat it
  const rest = recent.filter((a) => a.slug !== featured?.slug).slice(0, 3)

  return (
    <>
      <Hero />
      <Diagnosis />

      <section className="py-16 md:py-32">
        <Container>
          <SectionHead
            eyebrow="مقالات"
            title="آخرین نوشته‌ها"
            lead="قلب این سایت. هر نوشته یک مسئلهٔ عملیاتی را می‌گیرد و تا انتها می‌برد."
          />

          {featured ? (
            // priority: this is the LCP element here and nowhere else
            <ArticleCard article={featured} priority />
          ) : (
            <EmptyState
              title="هنوز مقاله‌ای منتشر نشده"
              body="اولین نوشته‌ها به‌زودی اینجا می‌آیند."
              action={{ label: "دربارهٔ من", href: "/about" }}
            />
          )}

          <div className="mt-12">
            {rest.map((article) => (
              <ArticleListItem key={article.slug} article={article} />
            ))}
          </div>

          {/* Topics as navigation, below the list rather than above it: the
              articles are what the visitor came for, and a filter row on top
              asks them to choose before they have seen anything to choose
              between. Reuses the chips from /articles, so the active states and
              the counts behave identically in both places. */}
          <div className="mt-12 border-t border-border pt-8">
            <TopicChips topics={withArticles} current={false} />
            <p>
              <Link href="/articles" className="text-300 font-medium">
                همهٔ مقالات ←
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <AboutBrief />
      <HowIWork />
      <FinalInvitation />
    </>
  )
}
