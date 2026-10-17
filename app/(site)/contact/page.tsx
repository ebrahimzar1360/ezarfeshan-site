import type { Metadata } from 'next'
import { Inline } from '@/components/cms/Inline'
import { ContactForm } from '@/components/site/ContactForm'
import { PageBand } from '@/components/site/PageBand'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { getChannels } from '@/lib/cms/site'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata('contact.seo', '/contact', 'تماس')
}

/**
 * The most minimal page: the ways to reach me and four form fields. No
 * telephone and no street address — removed at the owner's request
 * (1405/07/24). Channels, copy and form labels are the CMS's, so none is
 * written twice.
 */
export default async function ContactPage() {
  const [page, form, channels] = await Promise.all([
    getSection('contact.page'),
    getSection('contact.form'),
    getChannels(),
  ])

  return (
    <>
      <PageBand
        title={<Inline text={page.title} accentClass="text-gold-light" />}
        lead={page.lead ? <Inline text={page.lead} accentClass="text-gold-light" /> : undefined}
      />

      <Container className="py-12 md:py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
          {channels.length > 0 && (
            <section aria-labelledby="channels-title" className="card-v3 p-6 md:p-8" data-reveal>
              <h2 id="channels-title" className="text-600 font-extrabold">
                {page.channelsTitle}
              </h2>
              <ul className="mt-6 divide-y divide-border">
                {channels.map((c) => (
                  <li key={`${c.label}-${c.href}`}>
                    <a
                      href={c.href}
                      {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-center gap-4 py-4 no-underline"
                    >
                      <span
                        aria-hidden
                        className="grid size-12 flex-none place-items-center rounded-xl bg-forest text-500 text-paper transition-colors duration-150 group-hover:bg-emerald"
                      >
                        <Icon name={c.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-200 text-text-subtle">{c.label}</span>
                        <span
                          className={`mt-0.5 block break-all text-300 font-bold text-text transition-colors duration-150 group-hover:text-link ${
                            c.latin ? 'latin' : ''
                          }`}
                        >
                          {c.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="form-title" className="card-v3 p-6 md:p-8" data-reveal>
            <h2 id="form-title" className="text-600 font-extrabold">
              {page.formTitle}
            </h2>
            {page.formIntro && <p className="mt-2 text-300 text-text-muted">{page.formIntro}</p>}
            <div className="mt-6">
              <ContactForm copy={form} />
            </div>
          </section>
        </div>

        {(page.directTitle || page.directText) && (
          <div className="mt-6 rounded-2xl bg-bg-band px-6 py-6 md:px-8" data-reveal>
            {page.directTitle && <p className="text-400 font-bold">{page.directTitle}</p>}
            {page.directText && (
              <p className="mt-2 max-w-[40rem] text-300 leading-normal text-text-muted">
                <Inline text={page.directText} />
              </p>
            )}
          </div>
        )}
      </Container>
    </>
  )
}
