import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { getIdentity, getMainNav } from '@/lib/cms/site'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'
import { SoundToggle } from './SoundToggle'

/**
 * v3 header: logo, the main links, one forest-green button. Links and the
 * button come from the CMS (nav.main); an empty button label hides it.
 */
export async function Header() {
  const [nav, identity] = await Promise.all([getMainNav(), getIdentity()])
  const cta = nav.cta.label && nav.cta.href ? nav.cta : null

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border bg-bg/90 text-text backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-10 focus:rounded-md focus:bg-bg-raised focus:px-4 focus:py-2 focus:text-300"
      >
        پرش به محتوا
      </a>

      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo name={identity.name} nameLatin={identity.nameLatin} subline={identity.logoSubline} />

        <NavLinks items={nav.items} />

        <div className="flex items-center gap-2">
          <SoundToggle />
          {cta && (
            <Link
              href={cta.href}
              className="hidden h-11 items-center gap-2 rounded-lg bg-forest px-5 text-300 font-bold text-paper no-underline transition-colors duration-150 hover:bg-emerald hover:text-paper md:inline-flex"
            >
              {cta.label}
              <Icon name="arrow" className="text-400" />
            </Link>
          )}
          <MobileNav items={nav.items} cta={cta} title={nav.mobileTitle} />
        </div>
      </Container>
    </header>
  )
}
