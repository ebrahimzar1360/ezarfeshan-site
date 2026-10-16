import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { projects } from '@/lib/content/projects'
import { ProjectCard } from '../ProjectCard'

export function ProjectsPreview() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14" data-reveal>
          <div>
            <h2 className="text-700 font-extrabold md:text-800">پروژه‌های در حال توسعه</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
          </div>
          <Button href="/projects" variant="outline">
            همهٔ پروژه‌ها
            <Icon name="arrow" />
          </Button>
        </header>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {projects.slice(0, 3).map((p, i) => (
            <div key={p.slug} data-reveal style={{ '--d': i } as CSSProperties}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
