import type { Metadata } from 'next'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { CmsCta } from '@/components/cms/CmsCta'
import { CmsImage } from '@/components/cms/CmsImage'
import { Inline } from '@/components/cms/Inline'
import { PageBand } from '@/components/site/PageBand'
import { FieldExample } from '@/components/site/home/FieldExample'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { fa, yearsSince } from '@/lib/content/bio'
import { PAGE_PHOTOS } from '@/lib/content/photos'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata('about.seo', '/about', 'درباره من')
}

/** A king, drawn flat: the page's single image of "a decision". Decorative. */
function Chess() {
  return (
    <svg viewBox="0 0 200 250" aria-hidden focusable="false" className="h-auto w-44 md:w-56">
      <ellipse cx="100" cy="232" rx="78" ry="10" className="fill-black/30" />
      <rect x="95.5" y="10" width="9" height="30" rx="3" className="fill-gold" />
      <rect x="86" y="19" width="28" height="9" rx="3" className="fill-gold" />
      <circle cx="100" cy="64" r="26" className="fill-gold" />
      <circle cx="91" cy="56" r="8" className="fill-white/30" />
      <rect x="68" y="88" width="64" height="11" rx="5.5" className="fill-gold-d1" />
      <path d="M78 99 Q72 168 52 204 L148 204 Q128 168 122 99 Z" className="fill-gold" />
      <path d="M122 99 Q128 168 148 204 L118 204 Q112 160 110 99 Z" className="fill-gold-d1" />
      <rect x="40" y="204" width="120" height="20" rx="10" className="fill-gold-d1" />
      <rect x="40" y="204" width="120" height="8" rx="4" className="fill-gold-d2" />
    </svg>
  )
}

/**
 * Every figure on this page is a duration the owner stated, computed from its
 * start year so it cannot go stale. No outcome claims — no revenue, no client
 * counts, no percentages — because none were supplied.
 *
 * Order, as briefed: masthead with portrait → figures → the turning point →
 * the road → today's roles → learning → one real example → invitation. All
 * copy is the CMS's (about.*); the chatbot reads the same sections.
 */
export default async function AboutPage() {
  const [band, figuresS, turning, path, roles, learning] = await Promise.all([
    getSection('about.band'),
    getSection('about.figures'),
    getSection('about.turning'),
    getSection('about.path'),
    getSection('about.roles'),
    getSection('about.learning'),
  ])

  const stops = [
    ...path.milestones.map((m, i) => ({ key: `${m.year}-${i}`, when: fa(m.year), title: m.title, body: m.body, now: false })),
    ...(path.todayTitle || path.todayBody
      ? [{ key: 'today', when: path.todayTitle, title: '', body: path.todayBody, now: true }]
      : []),
  ]

  return (
    <>
      <PageBand
        title={<Inline text={band.title} accentClass="text-gold-light" />}
        lead={band.lead ? <Inline text={band.lead} accentClass="text-gold-light" /> : undefined}
        aside={
          band.portrait.src ? (
            <div className="relative mx-auto w-full max-w-xs self-end md:max-w-sm">
              <CmsImage
                image={band.portrait}
                sizes="(min-width: 768px) 24rem, 80vw"
                priority
                className="aspect-[4/4.6] w-full rounded-t-3xl object-cover object-top"
              />
            </div>
          ) : undefined
        }
      />

      {figuresS.items.length > 0 && (
        <section className="py-10 md:py-14">
          <Container>
            <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {figuresS.items.map((f, i) => (
                <div
                  key={`${f.label}-${i}`}
                  data-reveal
                  style={{ '--d': i } as CSSProperties}
                  className="card-v3 flex items-center gap-5 px-6 py-6"
                >
                  <span aria-hidden className="grid size-14 flex-none place-items-center rounded-xl bg-gold/20 text-700 text-forest">
                    <Icon name={f.icon as IconName} />
                  </span>
                  <div>
                    <dd className="text-800 font-black leading-none text-forest">
                      {fa(yearsSince(f.startYear))} <span className="text-400 font-bold">سال</span>
                    </dd>
                    <dt className="mt-2 text-300 text-text-muted">{f.label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* the setting of the work, not a picture of the owner: his own portrait stays in the masthead */}
      <figure className={figuresS.items.length > 0 ? 'pb-14 md:pb-20' : 'py-14 md:py-20'} data-reveal>
        <Container>
          <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_48px_-24px_var(--ink-30)]">
            <Image
              src={PAGE_PHOTOS.about.src}
              alt={PAGE_PHOTOS.about.alt}
              width={PAGE_PHOTOS.about.width}
              height={PAGE_PHOTOS.about.height}
              sizes="(min-width: 1280px) 76rem, 94vw"
              className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
            />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
          </div>
        </Container>
      </figure>

      <section className="tone-inverse bg-forest-deep py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div className="mx-auto" data-reveal>
            <Chess />
          </div>
          <div data-reveal>
            {turning.badge && (
              <p className="inline-flex rounded-md bg-gold px-3 py-1 text-200 font-bold text-forest-deep">
                {turning.badge}
              </p>
            )}
            <h2 className="mt-5 max-w-2xl text-700 font-extrabold leading-[1.45] text-gold-light md:text-800">
              {turning.title}
            </h2>
            <div className="mt-7 max-w-2xl space-y-5 text-400 leading-prose text-text-muted">
              {turning.before && <p><Inline text={turning.before} accentClass="text-gold-light" /></p>}
              {turning.emphasis && <p className="text-500 font-extrabold text-text">{turning.emphasis}</p>}
              {turning.after && <p><Inline text={turning.after} accentClass="text-gold-light" /></p>}
            </div>
          </div>
        </Container>
      </section>

      {stops.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <header className="mb-12 md:mb-16" data-reveal>
              <h2 className="text-700 font-extrabold md:text-800">{path.title}</h2>
              <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            </header>

            <ol className="relative ms-2 grid gap-9 border-s-2 border-border-strong md:ms-0 md:grid-cols-5 md:gap-5 md:border-s-0">
              <span aria-hidden className="tl-line hidden md:block" />
              {stops.map((s, i) => (
                <li
                  key={s.key}
                  data-reveal
                  style={{ '--d': i } as CSSProperties}
                  className="relative ps-7 md:ps-0 md:pt-10"
                >
                  <span
                    aria-hidden
                    className={`absolute -start-[0.6rem] top-1.5 size-4 rounded-full border-2 md:start-0 md:top-0 ${
                      s.now ? 'border-gold bg-gold' : 'border-forest bg-bg'
                    }`}
                  />
                  <p className="text-600 font-black text-forest">{s.when}</p>
                  {s.title && <h3 className="mt-1 text-400 font-extrabold leading-snug">{s.title}</h3>}
                  <p className="mt-2 text-300 leading-normal text-text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {roles.items.length > 0 && (
        <section className="bg-bg-band py-16 md:py-24">
          <Container>
            <header className="mb-10 md:mb-14" data-reveal>
              <h2 className="text-700 font-extrabold md:text-800">{roles.title}</h2>
              <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            </header>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.items.map((r, i) => (
                <li
                  key={`${r.title}-${i}`}
                  data-reveal
                  style={{ '--d': i % 3 } as CSSProperties}
                  className="card-v3 flex items-center gap-4 p-6"
                >
                  <span aria-hidden className="mt-2 size-2.5 flex-none rounded-full bg-gold" />
                  <p className="text-400 font-bold leading-snug">{r.title}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="py-16 md:py-24">
        <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
          <div data-reveal>
            <h2 className="text-700 font-extrabold md:text-800">{learning.title}</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            {learning.text && (
              <p className="mt-7 max-w-[30rem] text-500 leading-prose text-text-muted">
                <Inline text={learning.text} />
              </p>
            )}
          </div>
          {learning.keywords.length > 0 && (
            <ul className="flex flex-wrap gap-3" data-reveal>
              {learning.keywords.map((k, i) => (
                <li
                  key={`${k.text}-${i}`}
                  className="rounded-xl border border-border-strong bg-bg-raised px-5 py-3 text-400 font-bold"
                >
                  {k.text}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <FieldExample />

      <CmsCta section="about.cta" />
    </>
  )
}
