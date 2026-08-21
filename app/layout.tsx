import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name }],
  icons: {
    icon: [{ url: '/brand/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/icon-maskable.svg' }],
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
}

/**
 * The only place hex values are written outside globals.css. `theme-color` lands
 * in a <meta> tag that the browser reads before any stylesheet, so it cannot
 * reference a custom property. Keep in step with --bg in app/globals.css.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#141613' },
  ],
}

/**
 * Runs before first paint so a dark-mode visitor never sees a white flash.
 * Must stay in sync with components/site/ThemeToggle.tsx.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* The Persian face is on the critical path for every page. */}
        <link
          rel="preload"
          href="/fonts/vazirmatn-arabic.woff2"
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
