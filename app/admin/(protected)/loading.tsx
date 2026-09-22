import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <main className="mx-auto w-full max-w-(--container-page) px-6 py-12">
      <Skeleton className="h-9 w-48" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </main>
  )
}
