import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { currentJalaliYear, fa } from '@/lib/content/bio'
import { legalNav, nav, site, socials } from '@/lib/site'

const byLabel = (label: string) => socials.find((s) => s.label === label)?.href ?? '/contact'

const social: { label: string; href: string; icon: IconName }[] = [
  { label: 'ایمیل', href: `mailto:${site.email}`, icon: 'mail' },
  { label: 'لینکدین', href: byLabel('لینکدین'), icon: 'linkedin' },
  { label: 'واتس‌اپ', href: byLabel('واتس‌اپ'), icon: 'whatsapp' },
  { label: 'اینستاگرام', href: byLabel('اینستاگرام'), icon: 'instagram' },
]

/**
 * v3 footer: compact, on the forest ground. Logo, the five links, the four
 * contact icons, then the copyright line and the two legal links.
 */
export function Footer() {
  return (
    <footer className="tone-inverse bg-forest">
      <Container className="py-12 md:py-14">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <Logo tone="light" />

          <nav aria-label="ناوبری فوتر">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-300 text-paper/85 no-underline transition-colors duration-150 hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex gap-3">
            {social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex size-10 items-center justify-center rounded-lg border border-paper/25 text-500 text-paper no-underline transition-colors duration-150 hover:border-gold hover:text-gold-light"
                >
                  <Icon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-200 text-paper/70">
            © {fa(currentJalaliYear())} {site.name}. تمام حقوق محفوظ است.
          </p>
          <nav aria-label="صفحات حقوقی" className="flex gap-6">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-200 text-paper/70 no-underline transition-colors duration-150 hover:text-gold-light"
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
