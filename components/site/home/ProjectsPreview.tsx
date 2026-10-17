import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { getProjects } from '@/lib/content/projects'
import { projectRender } from '@/lib/content/renders'
import { ProjectsRoadmap } from './ProjectsRoadmap'

/**
 * The homepage's projects: heading and button from the CMS (home.projects),
 * the first `count` projects as a roadmap beside a 3D path of their pictures.
 * Projects without a screenshot show their 3D render (lib/content/renders.ts).
 */
export async function ProjectsPreview() {
  const [s, projects] = await Promise.all([getSection('home.projects'), getProjects()])
  const shown = projects.slice(0, s.count)
  if (shown.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14" data-reveal>
          <div>
            <h2 className="text-700 font-extrabold md:text-800">{s.title}</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
          </div>
          {s.button.label && (
            <Button href={s.button.href} variant="outline">
              {s.button.label}
              <Icon name="arrow" />
            </Button>
          )}
        </header>

        <ProjectsRoadmap
          items={shown.map((p) => ({ project: p, picture: p.image?.src ?? (p.mock ? projectRender(p.mock) : null) }))}
        />
      </Container>
    </section>
  )
}
