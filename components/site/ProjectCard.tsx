import type { Project } from '@/lib/content/projects'
import { ProjectMock } from './ProjectMock'

/** Status pill: gold sits behind ink, never in front of paper. */
export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1 text-200 font-bold text-forest-deep">
      <span aria-hidden className="size-1.5 rounded-full bg-forest-deep" />
      {children}
    </span>
  )
}

/**
 * Product card: the placeholder mock, the status, the title and one sentence.
 * No link — there is no product page to go to yet, and a dead "اطلاعات بیشتر"
 * is worse than none.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card-v3 card-v3-hover flex h-full flex-col overflow-hidden">
      <ProjectMock kind={project.mock} />
      <div className="flex flex-1 flex-col p-6">
        <div>
          <StatusBadge>{project.status}</StatusBadge>
        </div>
        <h3 className="mt-4 text-500 font-extrabold leading-snug">{project.title}</h3>
        <p className="mt-3 text-300 leading-normal text-text-muted">{project.text}</p>
      </div>
    </article>
  )
}
