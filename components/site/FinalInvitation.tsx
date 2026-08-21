import Link from 'next/link'
import { NewsletterForm } from '@/components/site/NewsletterForm'
import { Container } from '@/components/ui/Container'

/**
 * Closing block. The newsletter is the action; consulting is a quiet line
 * underneath it. The brief's CTA order is read → subscribe → enquire, and the
 * page must not invert that at the last moment by shouting "book a call".
 *
 * The form posts to /api/newsletter/subscribe: validated, rate limited,
 * honeypot-guarded, double opt-in. Nothing is subscribed until the emailed
 * link is clicked.
 */
export function FinalInvitation() {
  return (
    <section className="tone-inverse bg-forest py-20 md:py-40">
      <Container>
        <div className="max-w-(--container-measure)">
          <p className="mb-4 text-200 font-medium tracking-wide text-text-subtle">خبرنامه</p>
          <h2 className="text-600 md:text-700">هر دو هفته، یک نوشته دربارهٔ سیستم‌سازی</h2>
          <p className="mt-5 text-400 leading-prose text-text-muted">
            بدون تبلیغ، بدون خلاصهٔ کتاب. یک مسئلهٔ عملیاتی و راهی که جواب داده. هر وقت خواستی
            لغو عضویت کن.
          </p>

          <div className="mt-8">
            <NewsletterForm source="home" tone="inverse" />
          </div>

          <p className="mt-12 border-t border-border pt-6 text-300 text-text-muted">
            پروژه‌ای در ذهن داری؟{' '}
            <Link href="/consult" className="font-medium">
              درخواست مشاوره
            </Link>
          </p>
        </div>
      </Container>
    </section>
  )
}
