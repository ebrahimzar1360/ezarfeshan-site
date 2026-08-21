import { stats } from '@/lib/content/bio'

/**
 * Headline figures. Each is a duration Ebrahim stated, computed from its start
 * year — not an outcome claim, and not a number that goes stale.
 *
 * Gold is the accent on the numeral only. It is never the label text: on paper
 * it measures 2.10:1 and fails AA, so the reading weight sits in --text.
 */
export function Stats({ tone = 'default' }: { tone?: 'default' | 'inverse' }) {
  return (
    <dl className="flex flex-wrap gap-x-12 gap-y-6">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="text-700 font-bold text-text md:text-800">{s.value}</span>
            <span className="ms-1.5 text-300 text-text-muted">{s.unit}</span>
            <span
              className={`mt-1 block text-200 ${
                tone === 'inverse' ? 'text-text-muted' : 'text-text-subtle'
              }`}
            >
              {s.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
