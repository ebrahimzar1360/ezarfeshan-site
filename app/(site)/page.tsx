import { CtaBand } from '@/components/site/CtaBand'
import { ArticlesPreview } from '@/components/site/home/ArticlesPreview'
import { Experience } from '@/components/site/home/Experience'
import { Hero } from '@/components/site/home/Hero'
import { Metrics } from '@/components/site/home/Metrics'
import { Pillars } from '@/components/site/home/Pillars'
import { ProjectsPreview } from '@/components/site/home/ProjectsPreview'
import { getPublishedArticles } from '@/lib/content/queries'

/**
 * v3 homepage, in the order the brief fixes: the hero, "از شفافیت تا هوشمندی",
 * the experience line, the three projects, the notes, the three durations, and
 * the closing invitation. One message per section.
 */
export const revalidate = 3600

export default async function HomePage() {
  const recent = await getPublishedArticles(3)

  return (
    <>
      <Hero />
      <Pillars />
      <Experience />
      <ProjectsPreview />
      <ArticlesPreview articles={recent} />
      <Metrics />
      <CtaBand
        title="برای گفت‌وگو آماده‌ام"
        text="اگر فکر می‌کنید کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم."
        primary={{ label: 'شروع گفت‌وگو', href: '/contact' }}
      />
    </>
  )
}
