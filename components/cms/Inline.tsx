import Link from 'next/link'
import { Fragment } from 'react'
import { parseInline } from '@/lib/cms/tokens'
import { isExternalHref, isSafeHref } from '@/lib/cms/url'

/**
 * Renders one piece of editable copy with the small inline syntax from
 * lib/cms/tokens.ts. `accentClass` decides what *emphasis* looks like on the
 * ground it sits on — gold-light on forest, emerald on paper. Gold is never
 * passed for a light ground (2.10:1).
 */
export function Inline({ text, accentClass = 'text-emerald' }: { text: string; accentClass?: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        switch (part.kind) {
          case 'break':
            return <br key={i} />
          case 'accent':
            return (
              <span key={i} className={accentClass}>
                {part.text}
              </span>
            )
          case 'strong':
            return <strong key={i}>{part.text}</strong>
          case 'link':
            if (!isSafeHref(part.href)) return <Fragment key={i}>{part.text}</Fragment>
            return isExternalHref(part.href) ? (
              <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="font-medium">
                {part.text}
              </a>
            ) : (
              <Link key={i} href={part.href} className="font-medium">
                {part.text}
              </Link>
            )
          default:
            return <Fragment key={i}>{part.text}</Fragment>
        }
      })}
    </>
  )
}
