import type { Metadata } from 'next'
import { Inline } from '@/components/cms/Inline'
import { PageBand } from '@/components/site/PageBand'
import { ReferencesNote } from '@/components/site/ReferencesNote'
import { ArticleGrid } from '@/components/ui/ArticleGrid'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TopicChips } from '@/components/ui/TopicChips'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { pageCount } from '@/lib/content/pagination'
import { getPublishedArticlesPage, getTopics } from '@/lib/content/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata('articles.seo', '/articles', 'یادداشت‌ها')
}

export default async function ArticlesPage() {
  const [{ items, total }, topics, copy] = await Promise.all([
    getPublishedArticlesPage(1),
    getTopics(),
    getSection('articles.index'),
  ])
  const chips = topics.map((t) => ({ slug: t.slug, name: t.name }))

  return (
    <>
      <PageBand
        title={<Inline text={copy.title} accentClass="text-gold-light" />}
        lead={copy.lead ? <Inline text={copy.lead} accentClass="text-gold-light" /> : undefined}
      />

      <Container className="py-12 md:py-16">
        <TopicChips topics={chips} />

        {items.length === 0 ? (
          <EmptyState
            title={copy.emptyTitle}
            body={copy.emptyText}
            action={copy.emptyAction.label && copy.emptyAction.href ? copy.emptyAction : undefined}
          />
        ) : (
          <>
            <ArticleGrid items={items} priorityFirst />
            <Pagination
              page={1}
              count={pageCount(total)}
              hrefFor={(n) => (n === 1 ? '/articles' : `/articles/page/${n}`)}
            />
          </>
        )}

        <ReferencesNote className="mt-14 md:mt-20" />
      </Container>
    </>
  )
}
