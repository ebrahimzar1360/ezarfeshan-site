import { CmsImage } from '@/components/cms/CmsImage'
import { Inline } from '@/components/cms/Inline'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'

/**
 * "تجربه‌ای از دل کسب‌وکار واقعی" — one short paragraph, one button, and a real
 * photograph. The image sits in a plain rounded frame with a gold rule offset
 * behind it; the rule is a surface, not text. Copy: CMS home.experience.
 */
export async function Experience() {
  const s = await getSection('home.experience')

  return (
    <section className="bg-bg-band py-16 md:py-24">
      <Container className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div data-reveal>
          <h2 className="text-700 font-extrabold leading-tight md:text-800">
            <Inline text={s.title} />
          </h2>
          <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
          {s.text && (
            <p className="mt-7 max-w-[32rem] text-500 leading-prose text-text-muted">
              <Inline text={s.text} />
            </p>
          )}
          {s.button.label && (
            <div className="mt-8">
              <Button href={s.button.href} variant="brand" size="lg">
                {s.button.label}
                <Icon name="arrow" />
              </Button>
            </div>
          )}
        </div>

        {s.image.src && (
          <div className="relative mx-auto w-full max-w-sm md:max-w-none" data-reveal>
            <span
              aria-hidden
              className="absolute -bottom-3 -end-3 size-full rounded-2xl border-2 border-gold/70"
            />
            <CmsImage
              image={s.image}
              sizes="(min-width: 768px) 28rem, 90vw"
              className="relative aspect-[4/4.4] w-full rounded-2xl object-cover object-top shadow-[0_24px_48px_-24px_var(--ink-30)]"
            />
          </div>
        )}
      </Container>
    </section>
  )
}
