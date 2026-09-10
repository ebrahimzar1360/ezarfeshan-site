import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { formatDate } from '@/lib/format'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'شرایط استفاده',
  description: 'شرایط استفاده از محتوای این سایت و مرز مسئولیت آن.',
  alternates: { canonical: '/terms' },
}

/** Bumped by hand when the text below changes; rendered as a Jalali date. */
const LAST_UPDATED = '2026-09-10'

/**
 * Short on purpose. A page of boilerplate nobody reads is not a term; it is
 * cover. What matters here is three things: the writing is mine, using it
 * needs attribution, and reading it is not a consulting engagement.
 */
export default function TermsPage() {
  return (
    <Container width="measure" className="py-16 md:py-24">
      <div className="gold-marker">
        <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">شرایط استفاده</p>
        <h1 className="text-800">قاعده‌های ساده</h1>
      </div>

      <p className="mt-8 text-400 leading-prose text-text-muted">
        این صفحه کوتاه است چون قرار نیست چیزی را پشت متن حقوقی پنهان کند. سه نکته
        دارد.
      </p>

      <div className="prose mt-12">
        <h2>محتوا</h2>
        <p>
          نوشته‌ها، چک‌لیست‌ها و تصویرهای این سایت کار من است. می‌توانی آن‌ها را
          بخوانی، برای خودت یا تیمت استفاده کنی، و بخشی از آن را با ذکر نام و لینک به
          صفحهٔ اصلی نقل کنی. بازنشر کامل یک نوشته زیر نام دیگری، یا استفادهٔ تجاری از
          آن بدون اجازهٔ کتبی، مجاز نیست.
        </p>

        <h2>مرز مسئولیت</h2>
        <p>
          آنچه این‌جا می‌نویسم از تجربهٔ ادارهٔ کسب‌وکار خودم می‌آید، نه از یک نسخهٔ
          عمومی. خواندن یک نوشته، مشاورهٔ اختصاصی نیست و کسب‌وکار تو شرایط خودش را
          دارد. تصمیمی که بر پایهٔ این محتوا می‌گیری، تصمیم توست و مسئولیتش با توست.
        </p>

        <h2>فرم‌ها</h2>
        <p>
          فرستادن درخواست مشاوره، تعهدی برای هیچ‌کدام از دو طرف نمی‌سازد. من درخواست را
          می‌خوانم و ظرف ۴۸ ساعت کاری جواب می‌دهم — گاهی جواب این است که کارِ تو در
          حوزهٔ من نیست. همکاری وقتی شروع می‌شود که دامنهٔ کار و هزینه‌اش هر دو نوشته و
          توافق شده باشند. فرستادن مکرر و خودکار فرم‌ها یا تلاش برای اختلال در سایت
          مجاز نیست.
        </p>

        <h2>تغییر این شرایط</h2>
        <p>
          اگر این متن عوض شود، تاریخ پایین صفحه هم عوض می‌شود. تغییری که به‌ ضرر کسی
          باشد، بازگشتی به گذشته اعمال نمی‌شود.
        </p>

        <p>
          سؤالی داری؟{' '}
          <a href={`mailto:${site.email}`} className="latin">
            {site.email}
          </a>
        </p>
      </div>

      <p className="mt-12 border-t border-border pt-6 text-200 text-text-subtle">
        آخرین به‌روزرسانی: {formatDate(LAST_UPDATED)} ·{' '}
        <Link href="/privacy">حریم خصوصی</Link>
      </p>
    </Container>
  )
}
