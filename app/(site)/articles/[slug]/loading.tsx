import { Container } from '@/components/ui/Container'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/**
 * Deliberately no element carrying the `prose` class. e2e/site.spec.ts waits on
 * `.prose p` to prove an article is readable; if this frame also matched that
 * selector, the assertion could pass against a placeholder and the test would go
 * quietly useless.
 */
export default function ArticleLoading() {
  return (
    <Container className="py-14 md:py-20">
      <Skeleton className="h-4 w-40" />

      <div className="mt-8 max-w-(--container-measure)">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-4/5" />
        <Skeleton className="mt-6 h-6 w-full" />
        <Skeleton className="mt-2 h-6 w-3/5" />
        <Skeleton className="mt-7 h-3 w-48" />
      </div>

      <div className="relative mt-12 ps-6 md:ps-8">
        <span aria-hidden className="absolute inset-y-0 start-0 w-[3px] rounded-sm bg-border" />
        <SkeletonText lines={12} className="max-w-(--container-measure)" />
      </div>
    </Container>
  )
}
