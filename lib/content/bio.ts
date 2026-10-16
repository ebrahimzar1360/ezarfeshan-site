/**
 * Biography — supplied by Ebrahim, 1405/05/30.
 *
 * Durations are derived from the start year at render time, never written as a
 * literal. A hardcoded "۲۵ سال" silently becomes wrong next Nowruz; this does not.
 *
 * Nothing here is inferred. Every entry maps to something he stated. Where a
 * detail was not given — client names, revenue, team sizes — there is no entry.
 */

/** Current year in the Persian calendar. */
export function currentJalaliYear(): number {
  return Number(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' })
      .format(new Date())
      .replace(/\D/g, '')
  )
}

export function yearsSince(startJalali: number): number {
  return currentJalaliYear() - startJalali
}

/**
 * Persian digits, for narrative copy. Data and code keep Latin numerals.
 *
 * Grouping is off: every number this formats is a year or a count of years, and
 * the default locale grouping renders 1380 as ۱٬۳۸۰.
 */
export function fa(n: number): string {
  return n.toLocaleString('fa-IR', { useGrouping: false })
}

export type Milestone = {
  readonly year: number
  readonly title: string
  readonly body: string
  readonly ongoing?: boolean
}

export const milestones: readonly Milestone[] = [
  {
    year: 1380,
    title: 'ورود به صنعت خودرو',
    body: 'شروع فعالیت در فروش خودرو و قطعات یدکی خودرو',
  },
  {
    year: 1389,
    title: 'مدیریت نمایندگی سایپا',
    body: 'مسئولیت کامل فروش، خدمات، تیم و عملیات نمایندگی',
    ongoing: true,
  },
  {
    year: 1391,
    title: 'پخش قطعات یدکی خودرو',
    body: 'ورود جدی‌تر به زنجیره تأمین، انبار و شبکه توزیع',
    ongoing: true,
  },
  {
    year: 1397,
    title: 'تأسیس باشگاه ورزشی',
    body: 'تجربه ساخت و مدیریت یک مجموعه در حوزه‌ای متفاوت',
    ongoing: true,
  },
]

/** The last stop on the road: not a year, so it sits outside the ordered list. */
export const today = {
  title: 'امروز',
  body: 'ترکیب تجربه مدیریتی، سیستم‌سازی و هوش مصنوعی',
} as const

export type Role = { readonly title: string; readonly detail: string }

export const currentRoles: readonly Role[] = [
  { title: 'مدیر نمایندگی سایپا', detail: 'از ۱۳۸۹' },
  { title: 'فعال در فروش و پخش قطعات یدکی خودرو', detail: 'از ۱۳۹۱' },
  { title: 'رئیس هیئت شطرنج لارستان', detail: 'در حال حاضر' },
  { title: 'مؤسس باشگاه ورزشی', detail: 'از ۱۳۹۷' },
  { title: 'فعال در حوزه مدیریت، سیستم‌سازی و هوش مصنوعی', detail: 'امروز' },
]

/**
 * Field example. The one thing the brand rules ask for and a CV cannot supply:
 * something actually built, described concretely.
 *
 * Written strictly from what was stated — the swap from a discretionary bonus
 * scheme to a measured evaluation system, delivered as a web app. No outcome
 * figures appear because none were given. "It became measurable" is the claim,
 * and that claim is true; "it improved output by N%" would not be.
 */
export const fieldExample = {
  eyebrow: 'یک مثال',
  title: 'وقتی تشویق را با اندازه‌گیری عوض کردیم',
  problem: 'عملکرد خوب تعریف مشخصی نداشت و ارزیابی‌ها سلیقه‌ای بود.',
  action:
    'شاخص‌های عملکرد را مشخص کردیم و ارزیابی را به یک سیستم قابل اندازه‌گیری تبدیل کردیم.',
  result: 'تصمیم‌گیری شفاف‌تر شد و عملکرد از «حس» به «داده» نزدیک‌تر شد.',
} as const

export type Credential = { readonly title: string; readonly note?: string }

export const credentials: readonly Credential[] = [
  { title: 'MBA' },
  { title: 'DBA' },
  { title: 'دورهٔ تخصصی مارکتینگ' },
  { title: 'دورهٔ حرفه‌ای هوش مصنوعی', note: 'در حال گذراندن' },
]

/** Headline figures. Each one is a duration he stated, not an outcome claim. */
export const stats = [
  { get value() { return fa(yearsSince(1380)) }, unit: 'سال', label: 'در حوزهٔ خودرو' },
  { get value() { return fa(yearsSince(1389)) }, unit: 'سال', label: 'مدیریت نمایندگی' },
  { get value() { return fa(yearsSince(1391)) }, unit: 'سال', label: 'در پخش قطعات یدکی خودرو' },
] as const
