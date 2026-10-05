/**
 * Gold band between the hero and the first section: the subjects the site
 * writes about, running past slowly. Gold as a surface with ink on it (7.59:1),
 * which is the one way gold carries text on any ground.
 *
 * The list is rendered twice for a seamless loop; the copy is aria-hidden so a
 * screen reader hears it once.
 */
const TOPICS = [
  'سیستم‌سازی',
  'مستندسازی فرایند',
  'شاخص‌های عملیاتی',
  'هوش مصنوعی در کسب‌وکار',
  'استخدام و آموزش',
  'تفویض اختیار',
  'زنجیرهٔ تأمین و انبار',
  'ارزیابی عملکرد',
]

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {TOPICS.map((t) => (
        <li key={t} className="flex items-center gap-10 whitespace-nowrap text-400 font-bold">
          {t}
          <span aria-hidden className="block size-2 rotate-45 bg-ink" />
        </li>
      ))}
    </ul>
  )
}

export function Ribbon() {
  return (
    <div className="relative z-10 -my-px overflow-hidden bg-gold py-4 text-ink">
      <div className="marquee" aria-label="موضوع‌هایی که درباره‌شان می‌نویسم" role="region">
        <Track />
        <Track hidden />
      </div>
    </div>
  )
}
