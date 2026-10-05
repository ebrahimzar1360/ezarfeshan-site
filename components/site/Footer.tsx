import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { legalNav, nav, site, socials } from '@/lib/site'

/**
 * v2 footer: the tagline at display size as a sign-off, then the index.
 * Night ground with the blueprint grid — the page ends on the drafting table it
 * started on.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="tone-inverse tone-deep bp-grid relative overflow-hidden border-t border-border">
      <Container className="pb-10 pt-20 md:pt-28">
        <div className="flex flex-col gap-10 border-b border-border pb-14 md:flex-row md:items-end md:justify-between">
          <p className="text-display-sm font-black leading-[1.1]">
            سیستم بساز،
            <br />
            <span className="text-gold-light">آزاد باش.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/consult"
              className="inline-flex h-12 items-center rounded-md bg-solid-bg px-6 text-300 font-medium text-solid-text no-underline transition-colors duration-150 hover:bg-solid-bg-hover"
            >
              درخواست مشاوره
            </Link>
            <Link
              href="/newsletter"
              className="inline-flex h-12 items-center rounded-md border border-border-strong px-6 text-300 font-medium text-text no-underline transition-colors duration-150 hover:border-accent"
            >
              عضویت در خبرنامه
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-600 font-bold">{site.name}</p>
            <p className="mt-2 text-300 text-text-muted">{site.role}</p>
            <p className="mt-6 max-w-sm text-300 leading-prose text-text-muted">
              {site.description}
            </p>
          </div>

          <nav aria-label="ناوبری فوتر">
            <h2 className="mb-5 text-200 font-medium tracking-wide text-text-subtle">بخش‌ها</h2>
            <ul className="space-y-3">
              {[...nav, { label: 'درخواست مشاوره', href: '/consult' }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-300 text-text no-underline transition-colors duration-150 hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-5 text-200 font-medium tracking-wide text-text-subtle">ارتباط</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="latin text-300 text-text no-underline transition-colors duration-150 hover:text-gold-light"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.phone.href}
                  className="text-300 text-text no-underline transition-colors duration-150 hover:text-gold-light"
                >
                  {site.phone.display}
                </a>
              </li>
              {/* Only confirmed destinations render. */}
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-300 text-text no-underline transition-colors duration-150 hover:text-gold-light"
                  >
                    {s.label}
                    {s.handle && <span className="latin text-text-subtle"> · {s.handle}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-200 text-text-subtle">
            © <span className="latin">{year}</span> {site.name} · {site.address.city}، {site.address.region}
          </p>
          <nav aria-label="صفحات حقوقی" className="flex gap-6">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-200 text-text-muted no-underline transition-colors duration-150 hover:text-gold-light"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}
