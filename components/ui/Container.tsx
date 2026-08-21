import type { ReactNode } from 'react'

/**
 * Page gutter. Content stops growing at --container-page; past that the extra
 * width goes to the margin. Long lines of Persian are harder to read, not easier.
 */
export function Container({
  children,
  className = '',
  width = 'page',
}: {
  children: ReactNode
  className?: string
  width?: 'page' | 'measure'
}) {
  const max = width === 'measure' ? 'max-w-(--container-measure)' : 'max-w-(--container-page)'
  return (
    <div className={`mx-auto w-full ${max} px-[clamp(1.25rem,5vw,4rem)] ${className}`}>
      {children}
    </div>
  )
}
