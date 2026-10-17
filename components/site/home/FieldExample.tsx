import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { getSection } from '@/lib/cms/content'

/**
 * The one concrete thing built, as three numbered cards: the problem, what was
 * done, what changed. Copy is the CMS section `about.example` — the chatbot
 * reads the same section, so the page and the assistant cannot disagree.
 */
export async function FieldExample() {
  const fieldExample = await getSection('about.example')
  const cards = [
    { n: '۱', label: fieldExample.problemLabel, body: fieldExample.problem },
    { n: '۲', label: fieldExample.actionLabel, body: fieldExample.action },
    { n: '۳', label: fieldExample.resultLabel, body: fieldExample.result },
  ].filter((c) => c.body)
  if (cards.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-10 md:mb-14" data-reveal>
          <h2 className="text-700 font-extrabold leading-tight md:text-800">{fieldExample.title}</h2>
          <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
        </header>

        <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
          {cards.map((c, i) => (
            <li
              key={c.n}
              data-reveal
              style={{ '--d': i } as CSSProperties}
              className="card-v3 relative p-7 pt-9"
            >
              <span
                aria-hidden
                className="absolute -top-4 start-7 grid size-9 place-items-center rounded-full bg-gold text-400 font-black text-forest-deep"
              >
                {c.n}
              </span>
              <h3 className="text-500 font-extrabold">{c.label}</h3>
              <p className="mt-3 text-400 leading-prose text-text-muted">{c.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
