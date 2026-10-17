import type { Project } from '@/lib/content/projects'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'
import { ProjectMock } from './ProjectMock'

export function ProjectLink({ link, className = '' }: { link: { label: string; href: string }; className?: string }) {
  const external = /^https?:\/\//.test(link.href)
  return (
    <Link
      href={link.href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex items-center gap-1.5 text-300 font-bold ${className}`}
    >
      {link.label}
      <Icon name="arrow" />
    </Link>
  )
}

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
 * Product card: the picture or placeholder mock, the status, the title and one
 * sentence. The link only appears when the CMS gives the project one — a dead
 * "اطلاعات بیشتر" is worse than none.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card-v3 card-v3-hover flex h-full flex-col overflow-hidden">
      <ProjectMock project={project} />
      <div className="flex flex-1 flex-col p-6">
        {project.status && (
          <div>
            <StatusBadge>{project.status}</StatusBadge>
          </div>
        )}
        <h3 className="mt-4 text-500 font-extrabold leading-snug">{project.title}</h3>
        <p className="mt-3 text-300 leading-normal text-text-muted">{project.text}</p>
        {project.link && <ProjectLink link={project.link} className="mt-5" />}
      </div>
    </article>
  )
}
