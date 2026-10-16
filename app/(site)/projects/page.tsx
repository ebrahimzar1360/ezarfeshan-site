import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { CtaBand } from '@/components/site/CtaBand'
import { PageBand } from '@/components/site/PageBand'
import { ProjectMock } from '@/components/site/ProjectMock'
import { StatusBadge } from '@/components/site/ProjectCard'
import { Container } from '@/components/ui/Container'
import { projects } from '@/lib/content/projects'

export const metadata: Metadata = {
  title: 'پروژه‌ها',
  description: 'راهکارهایی برای مدیریت هوشمندتر کسب‌وکارها — پروژه‌هایی که در حال توسعه‌اند.',
  alternates: { canonical: '/projects' },
}

/**
 * Three products, each one card: what it is, one sentence, and its status. The
 * illustrations are placeholders drawn in the brand colours until real
 * screenshots exist; they claim nothing. All three are "در حال توسعه".
 */
export default function ProjectsPage() {
  return (
    <>
      <PageBand
        title={<span className="text-gold-light">پروژه‌های در حال توسعه</span>}
        lead="راهکارهایی برای مدیریت هوشمندتر کسب‌وکارها"
      />

      <section className="py-12 md:py-20">
        <Container>
          <ul className="space-y-6 md:space-y-8">
            {projects.map((p) => (
              <li key={p.slug} data-reveal style={{ '--d': 0 } as CSSProperties}>
                <article className="card-v3 grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
                  <div className="flex flex-col justify-center p-7 md:p-12">
                    <div>
                      <StatusBadge>{p.status}</StatusBadge>
                    </div>
                    <h2 className="mt-5 text-600 font-extrabold leading-snug md:text-700">{p.title}</h2>
                    <p className="mt-4 max-w-[28rem] text-400 leading-prose text-text-muted">{p.text}</p>
                  </div>
                  <div className="order-first md:order-none">
                    <ProjectMock kind={p.mock} />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand
        title="اگر ایده یا چالشی در کسب‌وکارتان دارید، می‌توانیم با هم بررسی کنیم."
        primary={{ label: 'تماس با من', href: '/contact' }}
      />
    </>
  )
}
