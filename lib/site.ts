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

  /** Shown as typed; wa.me needs the international form without + or 0. */
  whatsapp: { display: '۰۹۱۷۱۸۱۴۷۷۳', e164: '989171814773' },
  linkedinDisplay: 'linkedin.com/in/ebrahim-zarfeshan-6bb688423',
  instagramHandle: 'mindfullmanager1',

  /**
   * Phone, street address and opening hours were removed on 1405/07/24 at the
   * owner's request: the site routes people to email, WhatsApp, LinkedIn and
   * Instagram, and shows no physical address.
   */

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
    href: 'https://wa.me/989171814773',
    handle: null,
  },
  {
    label: 'اینستاگرام',
    href: 'https://instagram.com/mindfullmanager1',
    handle: 'mindfullmanager1',
  },
]

export const nav = [
  { label: 'خانه', href: '/' },
  { label: 'درباره من', href: '/about' },
  { label: 'پروژه‌ها', href: '/projects' },
  { label: 'یادداشت‌ها', href: '/articles' },
  { label: 'تماس', href: '/contact' },
] as const

export const legalNav = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'شرایط استفاده', href: '/terms' },
] as const
