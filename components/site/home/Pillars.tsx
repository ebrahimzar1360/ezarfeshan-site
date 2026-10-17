import { Container } from '@/components/ui/Container'
import { getSection } from '@/lib/cms/content'
import { PillarsJourney } from './PillarsJourney'

/**
 * "از شفافیت تا هوشمندی" — one scroll beat per card, as the RCA site walks
 * through R, C and A: the card in view on the reading side, a 3D figure of its
 * pillar on the other, flowing into the next figure as the visitor scrolls.
 * Copy and order come from the CMS (home.pillars), unchanged; the figures are
 * decorative.
 */
export async function Pillars() {
  const { title, cards } = await getSection('home.pillars')
  if (cards.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-6 text-center md:mb-10" data-reveal>
          <h2 className="text-700 font-extrabold md:text-800">{title}</h2>
          <span aria-hidden className="mx-auto mt-5 block h-1 w-14 rounded-full bg-gold" />
        </header>

        <PillarsJourney cards={cards.map((c) => ({ kind: c.kind, title: c.title, tag: c.tag, text: c.text }))} />
      </Container>
    </section>
  )
}
