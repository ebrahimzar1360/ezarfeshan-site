import type { Metadata } from 'next'
import { Inline } from '@/components/cms/Inline'
import { PageBand } from '@/components/site/PageBand'
import { ServicesBoard } from '@/components/site/services/ServicesBoard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSection } from '@/lib/cms/content'
import { cmsMetadata } from '@/lib/cms/metadata'
import { getServices } from '@/lib/content/services'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata('services.seo', '/services', 'خدمات')
}

/**
 * The four services, each a card with who it is for, the problem it answers,
 * what it delivers, how long and how it is priced, and one button that opens
 * the request form for that service. Requests are stored as leads
 * (source "services") and handled in /admin/leads.
 *
 * Every word is the CMS's: services.band, services.items, services.labels and
 * services.form. Prices are deliberately "after the first meeting" — the site
 * states no figure it cannot stand behind.
 */
export default async function ServicesPage() {
  const [band, services, labels, form] = await Promise.all([
    getSection('services.band'),
    getServices(),
    getSection('services.labels'),
    getSection('services.form'),
  ])

  return (
    <>
      <PageBand
        title={<Inline text={band.title} accentClass="text-gold-light" />}
        lead={band.lead ? <Inline text={band.lead} accentClass="text-gold-light" /> : undefined}
      />

      <section className="py-12 md:py-20">
        <Container>
          {services.length === 0 ? (
            <EmptyState title="خدمتی برای نمایش نیست" body="به‌زودی خدمات اینجا معرفی می‌شوند." />
          ) : (
            <ServicesBoard services={services} labels={labels} form={form} />
          )}
        </Container>
      </section>
    </>
  )
}
