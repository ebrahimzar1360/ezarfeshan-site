/**
 * The three products on /projects and the homepage preview.
 *
 * Copy is the owner's, verbatim (brief of 1405/07/24). All three are "در حال
 * توسعه": nothing here claims a launch, a client or a result.
 *
 * A project carries either `image` (a real picture from the owner, in
 * public/projects/) or `mock`, which selects the placeholder illustration in
 * components/site/ProjectMock.tsx. The mocks are drawn UI sketches, not
 * screenshots — replace each with a real screenshot when one exists (tracked in
 * docs/OPEN-QUESTIONS.md).
 */
export type ProjectImage = {
  readonly src: string
  readonly width: number
  readonly height: number
  readonly alt: string
  /** cover fills the frame; contain keeps a portrait device whole on white */
  readonly fit: 'cover' | 'contain'
  /** frame colour for `contain`, sampled from the picture's own edge */
  readonly bg?: string
}

export type Project = {
  readonly slug: string
  readonly title: string
  readonly text: string
  readonly status: string
  readonly mock?: 'performance' | 'tama' | 'intelligence'
  readonly image?: ProjectImage
}

export const projects: readonly Project[] = [
  {
    slug: 'performance-evaluation',
    title: 'سیستم ارزیابی عملکرد',
    text: 'سیستمی برای ارزیابی شفاف‌تر، بازخورد مؤثرتر و تصمیم‌گیری بهتر برای رشد تیم‌ها',
    status: 'در حال توسعه',
    mock: 'performance',
  },
  {
    slug: 'tama',
    title: 'TAMA | نوبت‌دهی هوشمند نمایندگی خودرو',
    text: 'مدیریت بهتر مراجعات، ظرفیت و منابع با داشبورد تحلیلی مدیریتی',
    status: 'در حال توسعه',
    mock: 'tama',
  },
  {
    slug: 'organizational-intelligence',
    title: 'اپلیکیشن هوش سازمانی',
    text: 'تبدیل داده‌ها و گزارش‌های پراکنده به بینش مدیریتی برای تصمیم‌گیری',
    status: 'در حال توسعه',
    mock: 'intelligence',
  },
  {
    slug: 'budgetyar',
    title: 'بودجه‌یار | سامانه بودجه‌بندی سالیانه',
    text: 'مدیریت مالی و بودجهٔ نمایندگی‌ها؛ تصمیم‌های بهتر با اطلاعات دقیق‌تر',
    status: 'در حال توسعه',
    image: {
      src: '/projects/budget-yar.webp',
      width: 1400,
      height: 933,
      alt: 'صفحهٔ ورود سامانهٔ بودجه‌یار برای نمایندگی خودرو',
      fit: 'cover',
    },
  },
  {
    slug: 'gam',
    title: 'گام | پلنر',
    text: 'پلنر برای هدف‌ها، عادت‌ها و برنامه‌ریزی روزانه؛ هر روز، یک گام نزدیک‌تر',
    status: 'در حال توسعه',
    image: {
      src: '/projects/gam.webp',
      width: 554,
      height: 1100,
      alt: 'صفحهٔ آغاز اپلیکیشن گام روی گوشی',
      fit: 'contain',
      bg: 'rgb(250 248 246)',
    },
  },
]
