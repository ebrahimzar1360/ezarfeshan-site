import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { formatDate } from '@/lib/format'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'چه داده‌ای جمع می‌شود، چرا، و چطور حذفش کنی.',
  alternates: { canonical: '/privacy' },
}

/** Bumped by hand when the text below changes; rendered as a Jalali date. */
const LAST_UPDATED = '2026-09-10'

/**
 * This page describes what the code actually does — not a template. Every
 * claim here is checkable against `app/api/analytics/pageview/route.ts`,
 * `lib/rate-limit.ts`, `lib/tokens.ts` and `prisma/schema.prisma`. If one of
 * those changes, this text changes with it.
 */
export default function PrivacyPage() {
  return (
    <Container width="measure" className="py-16 md:py-24">
      <div className="gold-marker">
        <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">حریم خصوصی</p>
        <h1 className="text-800">چه چیزی از تو نگه می‌دارم</h1>
      </div>

      <p className="mt-8 text-400 leading-prose text-text-muted">
        کوتاه: هیچ کوکی ردیابی، هیچ ابزار تبلیغاتی، و هیچ آدرس IP خامی روی این سایت
        ذخیره نمی‌شود. چیزی هم به کسی فروخته یا داده نمی‌شود. جزئیاتش این است.
      </p>

      <div className="prose mt-12">
        <h2>آمار بازدید</h2>
        <p>
          برای اینکه بدانم کدام نوشته خوانده می‌شود، برای هر بازدید این‌ها ثبت می‌شود:
          نشانی صفحه، صفحه‌ای که از آن آمده‌ای، و کشور. به‌جای شناسهٔ کاربر، یک
          «هَش» ذخیره می‌شود که از ترکیب آدرس IP، مرورگر و <em>تاریخ امروز</em> ساخته
          شده. چون تاریخ در آن هست، این هش هر نیمه‌شب عوض می‌شود و نمی‌شود بازدیدهای
          یک نفر را از یک روز به روز بعد وصل کرد. آدرس IP خام هیچ‌جا نوشته نمی‌شود و
          هش هم برگشت‌پذیر نیست.
        </p>
        <p>
          هیچ کوکی و هیچ <span className="latin">localStorage</span> برای آمار استفاده
          نمی‌شود. اگر مرورگرت <span className="latin">Do Not Track</span> بفرستد،
          بازدید اصلاً ثبت نمی‌شود.
        </p>

        <h2>فرم مشاوره</h2>
        <p>
          نام، ایمیل و توضیح مسئله‌ات لازم است؛ تلفن، نام کسب‌وکار، اندازهٔ تیم و بازهٔ
          بودجه اختیاری‌اند. این‌ها فقط برای همین استفاده می‌شوند: خواندن درخواستت و
          جواب دادن. به لیست خبرنامه اضافه نمی‌شوی مگر خودت جداگانه عضو شوی.
        </p>

        <h2>خبرنامه</h2>
        <p>
          ایمیل و — اگر بنویسی — نامت ذخیره می‌شود. عضویت دو‌مرحله‌ای است: تا وقتی روی
          لینک تأیید در ایمیل کلیک نکنی چیزی برایت فرستاده نمی‌شود، تا کسی نتواند
          ایمیل تو را بدون اجازه‌ات ثبت کند. توکن‌های تأیید و لغو عضویت فقط به شکل هش
          نگه‌داری می‌شوند و خودشان در پایگاه داده وجود ندارند. لغو عضویت با یک کلیک
          در پای هر ایمیل ممکن است و به هیچ توضیحی نیاز ندارد.
        </p>

        <h2>محدودیت نرخ درخواست</h2>
        <p>
          برای جلوگیری از ارسال انبوه توسط ربات‌ها، تعداد درخواست‌های هر فرستنده در یک
          بازهٔ کوتاه شمرده می‌شود. کلیدی که شمارش با آن انجام می‌شود، هش
          <span className="latin"> SHA-256 </span> است — نه آدرس، نه ایمیل. سطرهای
          منقضی هم پاک می‌شوند.
        </p>

        <h2>چه چیزی وجود ندارد</h2>
        <ul>
          <li>گوگل آنالیتیکس یا هر آمارگیر شخص ثالث</li>
          <li>پیکسل تبلیغاتی فیسبوک، اینستاگرام یا هر شبکهٔ دیگر</li>
          <li>کوکی ردیابی — تنها کوکی سایت، کوکی ورود من به بخش مدیریت است</li>
          <li>فروش، اجاره یا اشتراک‌گذاری داده با هیچ‌کس</li>
        </ul>

        <h2>سرویس‌های بیرونی</h2>
        <p>
          ایمیل‌های تأیید و خبرنامه از طریق یک سرویس ارسال ایمیل فرستاده می‌شوند، که
          برای تحویل‌دادن نامه ناگزیر نشانی ایمیل تو را می‌بیند. فونت‌ها روی همین
          سایت میزبانی شده‌اند، پس هنگام بازکردن صفحه هیچ درخواستی به گوگل یا جای
          دیگری فرستاده نمی‌شود.
        </p>

        <h2>حذف اطلاعاتت</h2>
        <p>
          به{' '}
          <a href={`mailto:${site.email}`} className="latin">
            {site.email}
          </a>{' '}
          ایمیل بزن و بنویس چه چیزی را می‌خواهی حذف کنم. لازم نیست دلیل بیاوری. هر
          چیزی که به تو مربوط باشد پاک می‌شود و خبرش را می‌دهم.
        </p>
      </div>

      <p className="mt-12 border-t border-border pt-6 text-200 text-text-subtle">
        آخرین به‌روزرسانی: {formatDate(LAST_UPDATED)} ·{' '}
        <Link href="/terms">شرایط استفاده</Link>
      </p>
    </Container>
  )
}
