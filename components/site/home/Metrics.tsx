import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { fa, yearsSince } from '@/lib/content/bio'

/**
 * Three durations the owner stated, each computed from its start year so the
 * figure cannot go stale at Nowruz. No outcome claims. The "+" is deliberate:
 * a duration counted in whole years undersells itself by up to a year.
 */
const metrics: { icon: IconName; start: number; label: string }[] = [
  { icon: 'car', start: 1380, label: 'تجربه در صنعت خودرو' },
  { icon: 'user', start: 1389, label: 'مدیریت نمایندگی' },
  { icon: 'box', start: 1391, label: 'فعالیت در قطعات یدکی خودرو' },
]

export function Metrics() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              data-reveal
              style={{ '--d': i } as CSSProperties}
              className="card-v3 flex items-center gap-5 px-6 py-6"
            >
              <span
                aria-hidden
                className="grid size-14 flex-none place-items-center rounded-xl bg-gold/20 text-700 text-forest"
              >
                <Icon name={m.icon} />
              </span>
              <div>
                <dd className="text-800 font-black leading-none text-forest">
                  <span dir="ltr" className="inline-block">
                    {fa(yearsSince(m.start))}+
                  </span>{' '}
                  <span className="text-400 font-bold">سال</span>
                </dd>
                <dt className="mt-2 text-300 text-text-muted">{m.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
