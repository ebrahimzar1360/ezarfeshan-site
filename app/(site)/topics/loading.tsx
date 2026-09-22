import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function TopicsLoading() {
  return (
    <Container className="py-16 md:py-24">
      <div className="gold-marker mb-10 md:mb-14">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-10 w-48" />
      </div>
      <div className="space-y-7">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border-t border-border pt-7">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-3 h-4 w-full max-w-(--container-measure)" />
          </div>
        ))}
      </div>
    </Container>
  )
}
