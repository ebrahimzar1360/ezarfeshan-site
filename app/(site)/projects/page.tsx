import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { CmsCta } from '@/components/cms/CmsCta'
import { Inline } from '@/components/cms/Inline'
import { PageBand } from '@/components/site/PageBand'
import { ProjectMock } from '@/components/site/ProjectMock'
import { ProjectLink, StatusBadge } from '@/components/site/ProjectCard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { getProjects } from '@/lib/content/projects'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata('projects.seo', '/projects', 'پروژه‌ها')
}

/**
 * The products, each one card: what it is, one sentence, and its status. A
 * project without a picture shows a placeholder drawn in the brand colours;
 * it claims nothing. List and order: CMS projects.items.
 */
export default async function ProjectsPage() {
  const [band, projects] = await Promise.all([getSection('projects.band'), getProjects()])

  return (
    <>
      <PageBand
        title={<Inline text={band.title} accentClass="text-gold-light" />}
        lead={band.lead ? <Inline text={band.lead} accentClass="text-gold-light" /> : undefined}
      />

      <section className="py-12 md:py-20">
        <Container>
          {projects.length === 0 ? (
            <EmptyState title="پروژه‌ای برای نمایش نیست" body="به‌زودی پروژه‌های تازه اینجا معرفی می‌شوند." />
          ) : (
            <ul className="space-y-6 md:space-y-8">
              {projects.map((p) => (
                <li key={p.slug} id={p.slug} data-reveal style={{ '--d': 0 } as CSSProperties}>
                  <article className="card-v3 grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
                    <div className="flex flex-col justify-center p-7 md:p-12">
                      {p.status && (
                        <div>
                          <StatusBadge>{p.status}</StatusBadge>
                        </div>
                      )}
                      <h2 className="mt-5 text-600 font-extrabold leading-snug md:text-700">{p.title}</h2>
                      <p className="mt-4 max-w-[28rem] text-400 leading-prose text-text-muted">{p.text}</p>
                      {p.link && <ProjectLink link={p.link} className="mt-6" />}
                    </div>
                    <div className="order-first md:order-none">
                      <ProjectMock project={p} />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <CmsCta section="projects.cta" />
    </>
  )
}
