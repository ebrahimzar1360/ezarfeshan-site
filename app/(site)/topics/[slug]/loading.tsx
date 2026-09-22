import { Container } from '@/components/ui/Container'
import { Skeleton, SkeletonArticleList } from '@/components/ui/Skeleton'

export default function TopicLoading() {
  return (
    <Container className="py-16 md:py-24">
      <Skeleton className="h-4 w-40" />
      <div className="gold-marker mt-8 mb-10 md:mb-14">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-3 h-10 w-64" />
        <Skeleton className="mt-5 h-5 w-full max-w-(--container-measure)" />
      </div>
      <SkeletonArticleList count={4} />
    </Container>
  )
}
