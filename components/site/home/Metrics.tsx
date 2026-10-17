import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { fa, yearsSince } from '@/lib/content/bio'

/**
 * Durations the owner stated, each computed from its start year so the figure
 * cannot go stale at Nowruz — the CMS stores the year, never the count. No
 * outcome claims. The "+" is deliberate: a duration counted in whole years
 * undersells itself by up to a year.
 */
export async function Metrics() {
  const { items } = await getSection('home.metrics')
  if (items.length === 0) return null

  return (
    <section className="py-14 md:py-20">
      <Container>
        <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {items.map((m, i) => (
            <div
              key={`${m.label}-${i}`}
              data-reveal
              style={{ '--d': i } as CSSProperties}
              className="card-v3 flex items-center gap-5 px-6 py-6"
            >
              <span
                aria-hidden
                className="grid size-14 flex-none place-items-center rounded-xl bg-gold/20 text-700 text-forest"
              >
                <Icon name={m.icon as IconName} />
              </span>
              <div>
                <dd className="text-800 font-black leading-none text-forest">
                  <span dir="ltr" className="inline-block">
                    {fa(yearsSince(m.startYear))}+
                  </span>{' '}
                  <span className="text-400 font-bold">سال</span>
                </dd>
                <dt className="mt-2 text-300 text-text-muted">{m.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
