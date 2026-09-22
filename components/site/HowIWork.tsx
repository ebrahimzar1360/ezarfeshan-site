import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'

/**
 * How a request is handled, in three steps.
 *
 * Nothing invented: every line restates what /consult already says — "اول توضیح
 * می‌دهی چه مسئله‌ای داری… اگر فکر کنم نمی‌توانم، همان را می‌گویم" — and the ۴۸
 * ساعت is the same figure on /contact, /consult and /terms. The block exists
 * because that process was only discoverable by opening the request page, which
 * is the one page a hesitant visitor does not open.
 *
 * Marked up as an ordered list with the counter from `.steps`, so the numbering
 * is real rather than three headings pretending to be a sequence — and so it
 * reads as an order to a screen reader.
 *
 * No h3 anywhere here. e2e/site.spec.ts clicks the first level-3 heading on the
 * homepage and expects an article; every h3 on this page belongs to the article
 * list.
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
    <section className="bg-bg-raised py-16 md:py-32">
      <Container>
        <SectionHead
          eyebrow="روند کار"
          title="اگر بخواهی شروع کنیم، چه اتفاقی می‌افتد"
        />
        <ol className="steps max-w-(--container-measure)">
          {steps.map((step) => (
            <li key={step.title}>
              <p className="text-500 font-bold text-text">{step.title}</p>
              <p className="mt-2 text-300 leading-prose text-text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
