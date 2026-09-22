import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <Container className="py-16 md:py-24">
      <div className="gold-marker mb-10 md:mb-14">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-10 w-52" />
      </div>
      <Skeleton className="h-12 w-full max-w-(--container-measure)" />
    </Container>
  )
}
