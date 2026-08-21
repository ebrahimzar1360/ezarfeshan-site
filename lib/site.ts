/**
 * Single source of truth for identity and contact details.
 * Anything still unknown is `null` — components must skip nulls rather than
 * render a dead link. Open items are tracked in docs/OPEN-QUESTIONS.md.
 */

export const site = {
  name: 'ابراهیم زرفشان',
  nameLatin: 'Ebrahim Zarfeshan',
  role: 'مشاور مدیریت کسب‌وکار و هوش مصنوعی',
  tagline: 'سیستم بساز، آزاد باش',
  positioning: 'مشاوری که هم از میدان آمده، هم از آینده',
  description:
    'کمک به مدیران برای رها شدن از درگیری‌های روزمرهٔ اجرایی، از طریق سیستم‌سازی و هوش مصنوعی.',

  /** Domain is still undecided; override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  email: 'ebrahimzarfeshan@gmail.com',

  locale: 'fa-IR',
  dir: 'rtl',
} as const

type SocialLink = {
  readonly label: string
  readonly href: string
  readonly handle: string | null
}

/**
 * Only confirmed destinations appear here — an unknown link is left out rather
 * than pointed somewhere plausible. Tracking parameters are stripped: the
 * `utm_*` tail on a shared LinkedIn URL identifies the share, not the profile.
 */
export const socials: readonly SocialLink[] = [
  {
    label: 'لینکدین',
    href: 'https://www.linkedin.com/in/ebrahim-zarfeshan-6bb688423',
    handle: null,
  },
  {
    label: 'واتس‌اپ',
    href: 'https://wa.me/qr/56AZQE4QDCMEN1',
    handle: null,
  },
  {
    label: 'اینستاگرام',
    href: 'https://instagram.com/mindfulmanager1',
    handle: 'mindfulmanager1',
  },
]

export const nav = [
  { label: 'مقالات', href: '/articles' },
  { label: 'موضوع‌ها', href: '/topics' },
  { label: 'منابع', href: '/resources' },
  { label: 'درباره', href: '/about' },
] as const

export const legalNav = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'شرایط استفاده', href: '/terms' },
  { label: 'تماس', href: '/contact' },
] as const
