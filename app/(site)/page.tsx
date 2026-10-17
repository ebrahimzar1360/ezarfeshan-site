import type { Metadata } from 'next'
import { CmsCta } from '@/components/cms/CmsCta'
import { ArticlesPreview } from '@/components/site/home/ArticlesPreview'
import { Experience } from '@/components/site/home/Experience'
import { Hero } from '@/components/site/home/Hero'
import { Metrics } from '@/components/site/home/Metrics'
import { Pillars } from '@/components/site/home/Pillars'
import { ProjectsPreview } from '@/components/site/home/ProjectsPreview'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { getPublishedArticles } from '@/lib/content/queries'

/**
 * v3 homepage, in the order the brief fixes: the hero, "از شفافیت تا هوشمندی",
 * the experience line, the projects, the notes, the durations, and the closing
 * invitation. One message per section; every word of it is editable in
 * /admin/content.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const meta = await cmsMetadata('home.seo', '/')
  // the root layout's title template would append the name a second time
  return meta.title ? { ...meta, title: { absolute: String(meta.title) } } : meta
}

export default async function HomePage() {
  const { count } = await getSection('home.articles')
  const recent = count > 0 ? await getPublishedArticles(count) : []

  return (
    <>
      <Hero />
      <Pillars />
      <Experience />
      <ProjectsPreview />
      <ArticlesPreview articles={recent} />
      <Metrics />
      <CmsCta section="home.cta" />
    </>
  )
}
