import type { ReactNode } from 'react'

/**
 * Allowlisted MDX components.
 *
 * next-mdx-remote renders whatever the body asks for; anything not in this map
 * falls back to the plain HTML element. That is the XSS boundary — article
 * bodies come from the database, so nothing here may render raw HTML, and no
 * `dangerouslySetInnerHTML` appears in this file.
 */

function Callout({ children, tone = 'note' }: { children: ReactNode; tone?: 'note' | 'warn' }) {
  const border = tone === 'warn' ? 'border-accent' : 'border-border-strong'
  return (
    <aside
      role="note"
      className={`my-8 border-inline-start-4 ${border} gold-marker bg-bg-sunken px-5 py-4 [&>p]:my-0`}
    >
      {children}
    </aside>
  )
}

function Quote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="my-10">
      <blockquote className="gold-marker text-500 leading-snug text-text [&>p]:my-0">
        {children}
      </blockquote>
      {cite && <figcaption className="mt-3 ps-4 text-200 text-text-subtle">{cite}</figcaption>}
    </figure>
  )
}

/** The only place a large numeral appears — and only ever with a real figure. */
function KeyNumber({ value, label }: { value: string; label: string }) {
  return (
    <div className="my-10 gold-marker">
      <p className="text-800 font-bold leading-none text-text md:text-900">{value}</p>
      <p className="mt-2 text-300 text-text-muted">{label}</p>
    </div>
  )
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="my-8 list-none ps-0 [counter-reset:step]">{children}</ol>
}

function Table({ children }: { children: ReactNode }) {
  // wide tables scroll inside their own box; the page itself never scrolls sideways
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-300">{children}</table>
    </div>
  )
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-10">
      {/* eslint-disable-next-line @next/next/no-img-element -- body images are
          arbitrary paths from the editor; next/image needs known dimensions */}
      <img src={src} alt={alt} loading="lazy" className="rounded-md border border-border" />
      {caption && (
        <figcaption className="mt-3 text-200 text-text-subtle">{caption}</figcaption>
      )}
    </figure>
  )
}

export const mdxComponents = {
  Callout,
  Quote,
  KeyNumber,
  Steps,
  Figure,
  table: Table,
  // Markdown links to other pages still need to look like the rest of the site
  a: (props: { href?: string; children?: ReactNode }) => (
    <a
      {...props}
      {...(props.href?.startsWith('http')
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    />
  ),
}
