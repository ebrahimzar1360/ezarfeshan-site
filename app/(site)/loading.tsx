import { Container } from '@/components/ui/Container'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** Generic fallback for site segments without a shape-matched skeleton. */
export default function Loading() {
  return (
    <Container className="py-16 md:py-24">
      <Skeleton className="h-10 w-72" />
      <SkeletonText lines={3} className="mt-8 max-w-(--container-measure)" />
    </Container>
  )
}
