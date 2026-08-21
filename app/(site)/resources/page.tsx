import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
import { db } from '@/lib/db'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'منابع',
  description: 'چک‌لیست‌ها و تمپلیت‌های قابل دانلود برای سیستم‌سازی.',
}

/**
 * The download machinery is built and wired, but no resource exists yet — no
 * file was supplied. Rather than shipping a placeholder PDF, the page renders
 * an empty state and starts listing the moment a real resource is published.
 */
export default async function ResourcesPage() {
  const resources = await db.resource.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Container className="py-16 md:py-24">
      <SectionHead
        as="h1"
        eyebrow="منابع"
        title="چک‌لیست و تمپلیت"
        lead="ابزارهای عملی که می‌توانی همین امروز استفاده کنی."
      />

      {resources.length === 0 ? (
        <EmptyState
          title="هنوز منبعی منتشر نشده"
          body="اولین چک‌لیست‌ها در حال آماده شدن‌اند. اگر می‌خواهی وقتی منتشر شدند خبردار شوی، عضو خبرنامه شو."
          action={{ label: 'عضویت در خبرنامه', href: '/newsletter' }}
        />
      ) : (
        <ul className="space-y-0">
          {resources.map((r) => (
            <li key={r.id} className="border-t border-border py-7">
              <a href={`/resources/${r.slug}`} className="text-500 font-bold no-underline">
                {r.title}
              </a>
              <p className="mt-2.5 max-w-(--container-measure) text-300 leading-normal text-text-muted">
                {r.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
