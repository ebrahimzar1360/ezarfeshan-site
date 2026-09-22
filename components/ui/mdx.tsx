import type { ReactNode } from 'react'
import { createSlugger } from '@/lib/content/mdx'
import { cn } from '@/lib/utils'

/**
 * Allowlisted MDX components.
 *
 * next-mdx-remote renders whatever the body asks for; anything not in this map
 * falls back to the plain HTML element. That is the XSS boundary — article
 * bodies come from the database, so nothing here may render raw HTML, and no
 * `dangerouslySetInnerHTML` appears in this file.
 *
 * Exported as a factory rather than a constant because the heading components
 * need a slugger whose collision counter starts at zero for each article. A
 * module-level one would number the second article's "مقدمه" as `مقدمه-1`
 * purely because an earlier render had seen that word.
 */

type Tone = 'note' | 'warn' | 'example' | 'summary'

/**
 * The gold marker, tinted per tone.
 *
 * The previous version wrote `border-inline-start-4`, which is a CSS property
 * name rather than a Tailwind utility and compiled to nothing — the visible
 * border came from `gold-marker`, which hard-codes `var(--accent)`. So the
 * `border-accent` / `border-border-strong` branch never applied and `note` and
 * `warn` rendered identically. `.gold-marker` now reads `--marker-color`, so the
 * tone is carried by a variable the class actually uses.
 *
 * Four tones, no new semantic colours: the palette is five and has no red.
 */
const TONE_MARKER: Record<Tone, string> = {
  note: '[--marker-color:var(--border-strong)]',
  warn: '[--marker-color:var(--accent)]',
  example: '[--marker-color:var(--link)]',
  summary: '[--marker-color:var(--accent)]',
}

const TONE_LABEL: Record<Tone, string> = {
  note: 'نکته',
  warn: 'هشدار',
  example: 'مثال',
  summary: 'جمع‌بندی',
}

function Callout({ children, tone = 'note' }: { children: ReactNode; tone?: Tone }) {
  return (
    <aside
      role="note"
      className={cn(
        'gold-marker my-8 bg-bg-sunken px-5 py-4 [&>p]:my-0',
        TONE_MARKER[tone] ?? TONE_MARKER.note
      )}
    >
      <p className="mb-2 text-200 font-medium tracking-wide text-text-subtle">
        {TONE_LABEL[tone] ?? TONE_LABEL.note}
      </p>
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

/**
 * Numbered steps.
 *
 * The previous version set `counter-reset: step` and then never incremented or
 * printed it, while `list-none` had already turned off the browser's own
 * numbering — so it rendered an unnumbered, unindented list, strictly worse than
 * a plain <ol>. The counter now lives in `.steps` in globals.css, where the
 * `li::before` that prints it can also carry the gold marker.
 */
function Steps({ children }: { children: ReactNode }) {
  return <ol className="steps my-8">{children}</ol>
}

function Table({ children }: { children: ReactNode }) {
  // wide tables scroll inside their own box; the page itself never scrolls sideways
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-300">{children}</table>
    </div>
  )
}

function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className="my-10">
      {/* eslint-disable-next-line @next/next/no-img-element -- body images are
          arbitrary paths from the editor; next/image needs known dimensions.
          width/height are optional so an editor that knows them can prevent the
          layout shift, and one that does not still gets a working image. */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="rounded-md border border-border"
      />
      {caption && <figcaption className="mt-3 text-200 text-text-subtle">{caption}</figcaption>}
    </figure>
  )
}

/** Flattens children to text so the heading can be slugged. */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'object' && 'props' in node) {
    return textOf((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

export function createMdxComponents() {
  const slugger = createSlugger()

  function heading(Tag: 'h2' | 'h3') {
    return function Heading({ children }: { children?: ReactNode }) {
      const id = slugger.slug(textOf(children).trim())
      return (
        <Tag id={id} className="group/h">
          {children}
          {/* The label lives on the anchor, and the § is aria-hidden, so the
              heading's own accessible name stays exactly its text. Positioned
              with margin rather than `position:absolute; left:…` — there is no
              physical left here. */}
          <a
            href={`#${id}`}
            aria-label="پیوند به این بخش"
            className="ms-2 text-text-subtle no-underline opacity-0 transition-opacity duration-150 group-hover/h:opacity-100 focus-visible:opacity-100"
          >
            <span aria-hidden>§</span>
          </a>
        </Tag>
      )
    }
  }

  return {
    Callout,
    Quote,
    KeyNumber,
    Steps,
    Figure,
    table: Table,
    h2: heading('h2'),
    h3: heading('h3'),
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
}
