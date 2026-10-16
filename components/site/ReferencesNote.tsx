import { Icon } from '@/components/ui/Icon'

const POINTS = [
  'کپی نیست',
  'ترجمهٔ ساده نیست',
  'با تجربهٔ واقعی و برای کسب‌وکارهای ایرانی بازنویسی شده',
]

/**
 * "منابع و ایده‌های مرجع" — the standing statement under every note and under
 * the list: the writing is not copied and not a plain translation, it is
 * inspired by credible international sources and rewritten for real Persian
 * business contexts. The source names are proper nouns and stay in Latin.
 *
 * It names the kinds of source, not specific articles: a per-article citation
 * list belongs in the article body, written by hand, when it exists.
 */
export function ReferencesNote({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-labelledby="refs-title"
      className={`card-v3 grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:gap-10 md:p-9 ${className}`}
    >
      <div>
        <h2 id="refs-title" className="text-600 font-extrabold">
          منابع و ایده‌های مرجع
        </h2>
        <p className="mt-4 max-w-[34rem] text-400 leading-prose text-text-muted">
          ایده‌ها از منابع معتبر بین‌المللی مانند{' '}
          <span className="latin font-medium text-text">Harvard Business Review</span>،{' '}
          <span className="latin font-medium text-text">MIT</span> و{' '}
          <span className="latin font-medium text-text">Stanford</span> الهام گرفته‌اند و سپس با
          تطبیق عملی برای کسب‌وکارهای واقعی بازنویسی شده‌اند.
        </p>
      </div>
      <ul className="space-y-3 self-center">
        {POINTS.map((p) => (
          <li key={p} className="flex items-start gap-3 text-300 leading-normal">
            <span
              aria-hidden
              className="mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-gold/30 text-300 text-forest"
            >
              <Icon name="check" />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </aside>
  )
}
