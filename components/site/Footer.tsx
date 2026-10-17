import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { getSection } from '@/lib/cms/content'
import { getChannels, getIdentity, getMainNav } from '@/lib/cms/site'
import { expandTokens } from '@/lib/cms/tokens'

/**
 * v3 footer: compact, on the forest ground. Logo, the main links, the contact
 * icons, then the copyright line and the legal links — all from the CMS.
 */
export async function Footer() {
  const [identity, nav, footer, channels] = await Promise.all([
    getIdentity(),
    getMainNav(),
    getSection('nav.footer'),
    getChannels(),
  ])
  const social = channels.filter((c) => c.inFooter)

  return (
    <footer className="tone-inverse bg-forest">
      <Container className="py-12 md:py-14">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <Logo tone="light" name={identity.name} nameLatin={identity.nameLatin} subline={identity.logoSubline} />

          {footer.showMainNav && (
            <nav aria-label="ناوبری فوتر">
              <ul className="flex flex-wrap gap-x-7 gap-y-3">
                {nav.items.map((item) => (
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
          )}

          {social.length > 0 && (
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
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-200 text-paper/70">{expandTokens(footer.copyright)}</p>
          {footer.legal.length > 0 && (
            <nav aria-label="صفحات حقوقی" className="flex gap-6">
              {footer.legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-200 text-paper/70 no-underline transition-colors duration-150 hover:text-gold-light"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </Container>
    </footer>
  )
}
