import type { Metadata } from 'next'
import { ConsultForm } from '@/components/site/ConsultForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
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
      <PageHeader
        tone="deep"
        eyebrow="مشاوره"
        title={
          <>
            درخواست <span className="text-gold-light">مشاوره</span>
          </>
        }
        lead={
          <>
            کارم کمک به مدیرانی است که کسب‌وکارشان بدون حضور دائمی خودشان کار نمی‌کند.{' '}
            {fa(yearsSince(1390))} سال است همین کار را در کسب‌وکار خودم می‌کنم.
          </>
        }
      />

      <Container className="py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Form first in source order on small screens is the wrong way round:
              the visitor should read how it works before being asked to fill
              anything. On large screens the two sit side by side and the form
              column sticks. */}
          <div>
            <div className="space-y-5 text-400 leading-prose text-text-muted">
              <p>
                اول توضیح می‌دهی چه مسئله‌ای داری. اگر فکر کنم می‌توانم کمک کنم، جواب می‌دهم و
                قرار می‌گذاریم. اگر فکر کنم نمی‌توانم، همان را می‌گویم.
              </p>
            </div>

            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {['فرم را پر می‌کنی', 'ظرف ۴۸ ساعت کاری جواب', 'گفت‌وگوی اول رایگان'].map((t, i) => (
                <li key={t} className="panel flex items-center gap-3 px-4 py-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-forest text-200 font-bold text-paper">
                    {['۱', '۲', '۳'][i]}
                  </span>
                  <span className="text-300 font-medium leading-snug">{t}</span>
                </li>
              ))}
            </ol>

            {/* The pricing answer stays open on load: silence about price makes
                the visitor guess, and people guess high and leave. Every answer
                below is already stated somewhere on this site. */}
            <div className="mt-14">
              <h2 className="gold-marker mb-6 text-600">سؤال‌های رایج</h2>
              <Faq openIndex={0} entries={FAQ} />
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="panel p-6 shadow-(--shadow) md:p-9">
              <p className="mb-2 text-600 font-bold">فرم درخواست</p>
              <p className="mb-8 text-300 text-text-muted">چند دقیقه وقت می‌گیرد. همهٔ پاسخ‌ها فقط دست خودم می‌رسد.</p>
              <ConsultForm />
            </div>
          </div>
        </div>
      </Container>

      <section className="tone-inverse tone-deep bp-grid relative overflow-hidden py-20 md:py-28">
        <Container>
          <h2 className="text-700 font-black">قبل از فرستادن</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            <li className="panel bg-bg-raised/70 p-7 text-300 leading-prose text-text-muted">
              <strong className="block text-400 text-gold-light">اگر دنبال راه‌حل سریع هستی</strong>
              <span className="mt-3 block">
                سیستم‌سازی سریع نیست. نتیجه‌اش ماندگار است، ولی یک‌شبه نمی‌آید.
              </span>
            </li>
            <li className="panel bg-bg-raised/70 p-7 text-300 leading-prose text-text-muted">
              <strong className="block text-400 text-gold-light">اگر فقط دنبال ابزار هوش مصنوعی هستی</strong>
              <span className="mt-3 block">
                خودکار کردن کاری که فرایندش نوشته نشده، فقط بی‌نظمی را سریع‌تر می‌کند. اول
                فرایند.
              </span>
            </li>
            <li className="panel bg-bg-raised/70 p-7 text-300 leading-prose text-text-muted">
              <strong className="block text-400 text-gold-light">اگر مطمئن نیستی</strong>
              <span className="mt-3 block">
                از <a href="/articles">مقالات</a> شروع کن. اگر حرف‌ها به کارت آمد، بعد بنویس.
              </span>
            </li>
          </ul>
        </Container>
      </section>
    </>
  )
}
