/**
 * Fixed configuration: the site URL, locale, and the identity used where the
 * CMS cannot reach — transactional email, the OG image route, the chatbot's
 * system prompt, the lead-notification address.
 *
 * Everything a visitor reads on the pages (name, role, description, contact
 * channels, menus) is edited in /admin/content and read through lib/cms/;
 * its defaults live in lib/cms/registry.ts. Keep the two in step when the
 * name or the email address itself changes.
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
