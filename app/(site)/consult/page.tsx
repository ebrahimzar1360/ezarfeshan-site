import type { Metadata } from 'next'
import { ConsultForm } from '@/components/site/ConsultForm'
import { Container } from '@/components/ui/Container'
import { fa, yearsSince } from '@/lib/content/bio'
import { Faq } from '@/components/ui/Faq'

export const metadata: Metadata = {
  title: 'درخواست مشاوره',
  description: 'اگر کسب‌وکارت بدون حضور دائمی تو از حرکت می‌ایستد، بنویس.',
}

/**
 * Sourced, not written. Each answer restates something the site already commits
 * to elsewhere; if one of those changes, this changes with it.
 */
const FAQ = [
  {
    question: 'هزینه چقدر است؟',
    answer:
      'رقم ثابتی ندارم، چون دامنهٔ کار ثابت نیست — بازطراحی یک فرایند با سیستم‌سازی کل یک مجموعه فرق دارد. بیشتر پروژه‌ها در بازهٔ ۵۰ تا ۱۵۰ میلیون تومان جمع می‌شوند؛ کارهای کوچک‌تر و محدودتر زیر آن، و مجموعه‌های بزرگ‌تر بالای آن. عدد دقیق بعد از اولین گفت‌وگو نوشته می‌شود، وقتی هر دو بدانیم دقیقاً قرار است چه کاری انجام شود.',
  },
  {
    question: 'اولین جلسه هزینه دارد؟',
    answer:
      'نه. اولین گفت‌وگو هزینه‌ای ندارد. اگر هنوز تصوری از بودجه نداری، در فرم «نمی‌دانم» را انتخاب کن — این گزینه هست چون جواب رایجی است، نه چون تعارف است.',
  },
  {
    question: 'چقدر طول می‌کشد تا جواب بدهی؟',
    answer:
      'ظرف ۴۸ ساعت کاری خودم جواب می‌دهم — حتی اگر جواب این باشد که کارِ تو در حوزهٔ من نیست.',
  },
  {
    question: 'اگر کار من به حوزهٔ تو نخورد چه می‌شود؟',
    answer:
      'همان را می‌گویم. اول توضیح می‌دهی چه مسئله‌ای داری؛ اگر فکر کنم می‌توانم کمک کنم، جواب می‌دهم و قرار می‌گذاریم، و اگر فکر کنم نمی‌توانم، صریح می‌گویم.',
  },
  {
    question: 'فقط دنبال ابزار هوش مصنوعی هستم. کافی نیست؟',
    answer:
      'خودکار کردن کاری که فرایندش نوشته نشده، فقط بی‌نظمی را سریع‌تر می‌کند. اول فرایند، بعد ابزار.',
  },
] as const

export default function ConsultPage() {
  return (
    <>
      <Container width="measure" className="py-16 md:py-24">
        <div className="gold-marker">
          <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">مشاوره</p>
          <h1 className="text-800">درخواست مشاوره</h1>
        </div>
        <div className="mt-8 space-y-5 text-400 leading-prose text-text-muted">
          <p>
            کارم کمک به مدیرانی است که کسب‌وکارشان بدون حضور دائمی خودشان کار نمی‌کند.
            {' '}{fa(yearsSince(1389))} سال است همین کار را در کسب‌وکار خودم می‌کنم.
          </p>
          <p>
            اول توضیح می‌دهی چه مسئله‌ای داری. اگر فکر کنم می‌توانم کمک کنم، جواب می‌دهم و
            قرار می‌گذاریم. اگر فکر کنم نمی‌توانم، همان را می‌گویم.
          </p>
        </div>

        {/* The pricing box became the first FAQ entry rather than staying prose.
            Silence about price is not neutrality — it makes the visitor guess,
            and people guess high and leave — so that answer stays open on load
            while the rest collapse. The bands are the same ones the form offers,
            so the page and the field cannot drift apart. No invented number: the
            range is where the work has actually landed.

            Every answer below is already stated somewhere on this site — the
            intro above, the قبل از فرستادن block, /contact, /terms. Nothing here
            is a new claim; the block exists to make them findable and to emit
            FAQPage markup, which is the one thing this page had no way to earn. */}
        <div className="mt-10">
          <h2 className="gold-marker mb-6 text-600">سؤال‌های رایج</h2>
          <Faq openIndex={0} entries={FAQ} />
        </div>
      </Container>

      <Container width="measure" className="pb-20">
        <ConsultForm />
      </Container>

      <section className="tone-inverse bg-forest py-16 md:py-24">
        <Container width="measure">
          <h2 className="text-600">قبل از فرستادن</h2>
          <ul className="mt-6 space-y-4 text-300 leading-prose text-text-muted">
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر دنبال راه‌حل سریع هستی</strong> — سیستم‌سازی
              سریع نیست. نتیجه‌اش ماندگار است، ولی یک‌شبه نمی‌آید.
            </li>
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر فقط دنبال ابزار هوش مصنوعی هستی</strong> —
              خودکار کردن کاری که فرایندش نوشته نشده، فقط بی‌نظمی را سریع‌تر می‌کند. اول
              فرایند.
            </li>
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر مطمئن نیستی</strong> — از{' '}
              <a href="/articles">مقالات</a> شروع کن. اگر حرف‌ها به کارت آمد، بعد بنویس.
            </li>
          </ul>
        </Container>
      </section>
    </>
  )
}
