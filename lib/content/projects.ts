/**
 * The three products on /projects and the homepage preview.
 *
 * Copy is the owner's, verbatim (brief of 1405/07/24). All three are "در حال
 * توسعه": nothing here claims a launch, a client or a result.
 *
 * `mock` selects the placeholder illustration in components/site/ProjectMock.tsx.
 * They are drawn UI sketches, not screenshots — replace each with a real
 * screenshot when one exists (tracked in docs/OPEN-QUESTIONS.md).
 */
export type Project = {
  readonly slug: string
  readonly title: string
  readonly text: string
  readonly status: string
  readonly mock: 'performance' | 'tama' | 'intelligence'
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
    title: 'اپ هوش سازمانی',
    text: 'تبدیل داده‌ها و گزارش‌های پراکنده به بینش مدیریتی برای تصمیم‌گیری',
    status: 'در حال توسعه',
    mock: 'intelligence',
  },
]
