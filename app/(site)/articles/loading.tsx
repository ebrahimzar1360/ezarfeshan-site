import { Container } from '@/components/ui/Container'
import { Skeleton, SkeletonArticleList } from '@/components/ui/Skeleton'

/**
 * Shaped to the real /articles page: the gold-marker header block, the topic
 * row, then the list. SkeletonArticleList repeats ArticleListItem's own rhythm
 * (border-t, py-7) so the content does not jump when it lands.
 */
export default function ArticlesLoading() {
  return (
    <Container className="py-16 md:py-24">
      <div className="gold-marker mb-10 md:mb-14">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-3 h-10 w-56" />
        <Skeleton className="mt-5 h-5 w-full max-w-(--container-measure)" />
      </div>
      <div className="mb-10 flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-24" />
        ))}
      </div>
      <SkeletonArticleList count={6} />
    </Container>
  )
}
