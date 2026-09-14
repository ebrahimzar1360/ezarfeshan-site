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

  /**
   * Confirmed 1405/06/24. Three separate forms because three consumers need
   * different ones and none may be derived at the call site:
   *   - `display` is what a Persian reader sees, in Persian digits
   *   - `href` is the tel: target, which must be E.164 Latin or iOS ignores it
   *   - `e164` is what schema.org/telephone expects
   * A component that formats its own phone number is a component that will
   * disagree with the next one.
   */
  phone: {
    display: '۰۷۱–۵۲۳۴۸۸۸۳',
    href: 'tel:+987152348883',
    e164: '+987152348883',
  },

  address: {
    display: 'فارس، لار، شهر قدیم، بلوار خلیج فارس',
    city: 'لار',
    region: 'فارس',
    country: 'IR',
    street: 'شهر قدیم، بلوار خلیج فارس',
  },

  /**
   * `display` is the human line; `schema` is the schema.org openingHours
   * syntax, which only accepts English day abbreviations and 24-hour times.
   * Saturday–Thursday is the Iranian working week.
   */
  hours: {
    display: 'شنبه تا پنج‌شنبه، ۹ تا ۱۷',
    schema: 'Sa,Su,Mo,Tu,We,Th 09:00-17:00',
  },

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
