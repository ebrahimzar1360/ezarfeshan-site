import { FaqJsonLd, type FaqEntry } from '@/components/seo/JsonLd'

/**
 * Questions and answers, as native <details>.
 *
 * No accordion library: every FAQ component on the shadcn registries is Radix
 * Accordion, roughly 12 kB for behaviour <details> gives free and that works
 * with JavaScript off. The chevron is the one icon that needs no RTL thought,
 * since it points down.
 *
 * One array drives both the visible list and the FAQPage markup — see
 * FaqJsonLd for why a divergence between the two is worse than no markup.
 */
export function Faq({
  entries,
  /** Index left open on load, for the answer too important to hide. */
  openIndex,
}: {
  entries: readonly FaqEntry[]
  openIndex?: number
}) {
  if (entries.length === 0) return null

  return (
    <>
      <FaqJsonLd entries={entries} />
      <div className="divide-y divide-border border-y border-border">
        {entries.map((entry, i) => (
          <details key={entry.question} open={i === openIndex} className="group/faq py-5">
            <summary className="flex cursor-pointer items-start justify-between gap-4 text-400 font-medium text-text [&::-webkit-details-marker]:hidden">
              {entry.question}
              <span
                aria-hidden
                className="mt-1 shrink-0 text-300 text-text-subtle transition-transform duration-150 group-open/faq:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <p className="mt-4 text-300 leading-prose text-text-muted">{entry.answer}</p>
          </details>
        ))}
      </div>
    </>
  )
}
