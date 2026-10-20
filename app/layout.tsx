import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { getIdentity } from '@/lib/cms/site'
import { plainInline } from '@/lib/cms/tokens'
import { site } from '@/lib/site'
import './globals.css'

/**
 * Site-wide defaults. Name, role and description are the CMS's (site.identity),
 * so renaming the site in the admin renames every <title> as well.
 */
export async function generateMetadata(): Promise<Metadata> {
  const identity = await getIdentity()
  const fallbackTitle = `${identity.name} — ${identity.role}`
  const description = plainInline(identity.description)
  return {
    metadataBase: new URL(site.url),
    title: { default: fallbackTitle, template: `%s — ${identity.name}` },
    description,
    authors: [{ name: identity.name }],
    icons: {
      icon: [{ url: '/brand/favicon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/brand/icon-maskable.svg' }],
    },
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: identity.name,
      title: fallbackTitle,
      description,
    },
    robots: { index: true, follow: true },
  }
}

/**
 * The only place hex values are written outside globals.css. `theme-color` lands
 * in a <meta> tag that the browser reads before any stylesheet, so it cannot
 * reference a custom property. Keep in step with --bg in app/globals.css.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f4ec' },
    { media: '(prefers-color-scheme: dark)', color: '#121821' },
  ],
}

/**
 * Runs before first paint so a dark-mode visitor never sees a white flash.
 * Must stay in sync with components/site/ThemeToggle.tsx.
 *
 * It also marks <html class="js">. Scroll reveals only hide content under that
 * class, so a visitor without JavaScript never gets a page of invisible blocks.
 */
const themeScript = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* The Persian text face and the heading naskh are on the critical path
            for every page; preloading the naskh keeps headings from reflowing. */}
        <link
          rel="preload"
          href="/fonts/estedad-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/noto-naskh-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      {/* Header and footer belong to app/(site)/layout.tsx, not here — the
          admin panel shares this root layout and must not inherit them. */}
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  )
}
