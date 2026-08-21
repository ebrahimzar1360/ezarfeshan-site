import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { legalNav, nav, site, socials } from '@/lib/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="tone-inverse bg-forest">
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-600 font-bold">{site.name}</p>
            <p className="mt-2 text-300 text-text-muted">{site.role}</p>
            <p className="mt-6 max-w-sm text-300 leading-prose text-text-muted">
              {site.description}
            </p>
          </div>

          <nav aria-label="ناوبری فوتر">
            <h2 className="mb-4 text-200 font-medium tracking-wide text-text-subtle">بخش‌ها</h2>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-300 text-text no-underline transition-colors duration-150 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-200 font-medium tracking-wide text-text-subtle">ارتباط</h2>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="latin text-300 text-text no-underline transition-colors duration-150 hover:text-gold"
                >
                  {site.email}
                </a>
              </li>
              {/* Only confirmed destinations render. An unknown link is left out
                  entirely rather than pointed somewhere plausible. */}
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-300 text-text no-underline transition-colors duration-150 hover:text-gold"
                  >
                    {s.label}
                    {s.handle && <span className="latin text-text-subtle"> · {s.handle}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-200 text-text-subtle">
            © <span className="latin">{year}</span> {site.name}
          </p>
          <nav aria-label="صفحات حقوقی" className="flex gap-6">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-200 text-text-muted no-underline transition-colors duration-150 hover:text-gold"
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
