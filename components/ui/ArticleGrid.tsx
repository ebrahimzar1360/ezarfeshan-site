import type { CSSProperties } from 'react'
import type { ArticleCardData } from '@/lib/content/queries'
import { ArticleTile } from './ArticleCard'

/** Cards in a responsive grid, each revealed in a short stagger. */
export function ArticleGrid({ items, priorityFirst = false }: { items: ArticleCardData[]; priorityFirst?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a, i) => (
        <div key={a.slug} data-reveal style={{ '--d': i % 3 } as CSSProperties} className="flex">
          <ArticleTile article={a} priority={priorityFirst && i === 0} />
        </div>
      ))}
    </div>
  )
}
