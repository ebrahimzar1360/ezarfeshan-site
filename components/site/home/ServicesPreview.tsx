import type { CSSProperties } from 'react'
import { Inline } from '@/components/cms/Inline'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { fa } from '@/lib/content/bio'
import { getServices } from '@/lib/content/services'

/**
 * The homepage's short introduction to /services: heading, one sentence, and a
 * compact card per service whose button opens that service's request form
 * (/services?service=slug — ServicesBoard opens it on arrival). Copy:
 * home.services; the services themselves: services.items.
 */
export async function ServicesPreview() {
  const [s, services] = await Promise.all([getSection('home.services'), getServices()])
  if (s.hidden || services.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14" data-reveal>
          <div>
            <h2 className="text-700 font-extrabold md:text-800">
              <Inline text={s.title} />
            </h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            {s.text && <p className="mt-6 max-w-[38rem] text-400 leading-prose text-text-muted">{s.text}</p>}
          </div>
          {s.button.label && s.button.href && (
            <Button href={s.button.href} variant="outline">
              {s.button.label}
              <Icon name="arrow" />
            </Button>
          )}
        </header>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((v, i) => (
            <li
              key={v.slug}
              data-reveal
              style={{ '--d': i } as CSSProperties}
              className="card-v3 card-v3-hover flex flex-col p-6"
            >
              <span className="text-600 font-black leading-none text-forest dark:text-emerald-300">
                {fa(i + 1).padStart(2, '۰')}
              </span>
              {v.kind && <p className="mt-4 text-200 font-bold text-text-subtle">{v.kind}</p>}
              <h3 className="mt-2 text-400 font-extrabold leading-snug">{v.title}</h3>
              {v.audience && <p className="mt-3 text-200 leading-normal text-text-muted">{v.audience}</p>}
              <div className="mt-auto pt-6">
                <Button href={`/services?service=${v.slug}`} variant="brand" className="w-full whitespace-nowrap px-3">
                  {v.button}
                  <Icon name="arrow" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
