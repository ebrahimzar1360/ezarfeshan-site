import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'

/**
 * How a request is handled, in three steps.
 *
 * Nothing invented: every line restates what /consult already says, and the
 * ۴۸ ساعت is the same figure on /contact, /consult and /terms.
 *
 * Still an `ol.steps` — the counter prints Persian numerals and e2e counts the
 * three items — laid out as three columns joined by a drawn line.
 *
 * No h3 anywhere here: e2e/site.spec.ts clicks the first level-3 heading on the
 * homepage and expects an article.
 */
export function HowIWork() {
  const steps = [
    {
      title: 'می‌نویسی چه مسئله‌ای داری',
      body: 'یک فرم کوتاه: اندازهٔ تیم، بازهٔ بودجه، و اینکه دقیقاً کجا گیر کرده‌ای. همین برای تشخیص اینکه کار به من می‌خورد یا نه کافی است.',
    },
    {
      title: 'ظرف ۴۸ ساعت کاری جواب می‌گیری',
      body: 'اگر فکر کنم می‌توانم کمک کنم، قرار می‌گذاریم. اگر فکر کنم نمی‌توانم، همان را می‌گویم — این هم یک جواب است و زودتر گرفتنش به نفع توست.',
    },
    {
      title: 'اولین گفت‌وگو رایگان است',
      body: 'دامنهٔ کار و عدد دقیق بعد از آن نوشته می‌شود، وقتی هر دو بدانیم قرار است چه کاری انجام شود.',
    },
  ]

  return (
    <section className="bg-bg-band py-24 md:py-36">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="روند کار" title="اگر بخواهی شروع کنیم، چه اتفاقی می‌افتد" />
          <div className="mb-10 md:mb-14">
            <Button href="/consult" size="lg">
              درخواست مشاوره
            </Button>
          </div>
        </div>

        <ol className="steps steps-v2 rail-x grid gap-10 md:grid-cols-3 md:gap-8" data-reveal="">
          {steps.map((step, i) => (
            <li key={step.title} className="relative" data-reveal style={{ '--d': i } as CSSProperties}>
              <p className="text-500 font-bold text-text">{step.title}</p>
              <p className="mt-3 text-300 leading-prose text-text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
