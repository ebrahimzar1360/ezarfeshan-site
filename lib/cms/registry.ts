import type { Field, ImageValue, LinkValue, Option } from './fields'

/**
 * Every piece of site copy an editor can change, grouped by the page it lives on.
 *
 * Each section names its fields and carries the text the site shipped with as
 * its default. Nothing in the database means "use the default", so a fresh
 * install, a CI build against an empty database, and a section nobody has
 * touched all render exactly the copy below.
 *
 * Copy written here is the owner's (brief of 1405/07/24, bio of 1405/05/30) —
 * moved, not rewritten. Durations stay computed: `{{years:1380}}` in copy, and
 * `startYear` numbers in metric lists.
 */

const ICONS: readonly Option[] = [
  { value: 'mail', label: 'ایمیل' },
  { value: 'linkedin', label: 'لینکدین' },
  { value: 'whatsapp', label: 'واتس‌اپ' },
  { value: 'instagram', label: 'اینستاگرام' },
  { value: 'chat', label: 'گفت‌وگو' },
  { value: 'send', label: 'ارسال' },
  { value: 'external', label: 'پیوند بیرونی' },
  { value: 'car', label: 'خودرو' },
  { value: 'user', label: 'آدم' },
  { value: 'box', label: 'جعبه' },
  { value: 'check', label: 'تیک' },
  { value: 'search', label: 'جست‌وجو' },
]

export type IconValue =
  | 'mail'
  | 'linkedin'
  | 'whatsapp'
  | 'instagram'
  | 'chat'
  | 'send'
  | 'external'
  | 'car'
  | 'user'
  | 'box'
  | 'check'
  | 'search'

const SEO_FIELDS: readonly Field[] = [
  { type: 'text', name: 'title', label: 'عنوان صفحه (تگ title)', max: 70, hint: 'بهتر است زیر ۶۰ کاراکتر بماند.' },
  {
    type: 'textarea',
    name: 'description',
    label: 'توضیح متا',
    max: 200,
    rows: 3,
    hint: 'در نتایج گوگل زیر عنوان دیده می‌شود؛ ۱۲۰ تا ۱۶۰ کاراکتر.',
  },
  { type: 'image', name: 'ogImage', label: 'تصویر اشتراک‌گذاری (Open Graph)', hint: '۱۲۰۰×۶۳۰. خالی بماند تا تصویر خودکار ساخته شود.' },
]

const CTA_FIELDS: readonly Field[] = [
  { type: 'text', name: 'title', label: 'عنوان', required: true, max: 200 },
  { type: 'textarea', name: 'text', label: 'متن', rows: 3, max: 500 },
  { type: 'link', name: 'primary', label: 'دکمهٔ اصلی' },
  { type: 'link', name: 'secondary', label: 'دکمهٔ دوم', optional: true },
]

const INLINE_HINT = '*عبارت* برای رنگ تأکید، **عبارت** برای پررنگ، [متن](/مسیر) برای پیوند، {{years:1380}} برای سال‌های گذشته از یک سال.'

const img = (src: string, alt: string, width: number, height: number): ImageValue => ({ src, alt, width, height })
const link = (label: string, href: string): LinkValue => ({ label, href })
const noLink: LinkValue = { label: '', href: '' }
const noImage: ImageValue = { src: '', alt: '' }

function section<D extends Record<string, unknown>>(s: {
  key: string
  group: GroupKey
  label: string
  description?: string
  fields: readonly Field[]
  defaults: D
}) {
  return s
}

export const GROUPS = {
  global: { label: 'هویت و تماس', description: 'نام، معرفی کوتاه و راه‌های ارتباط — در همه‌جای سایت.' },
  header: { label: 'هدر و منو', description: 'پیوندهای منوی اصلی و دکمهٔ بالای صفحه.' },
  footer: { label: 'فوتر', description: 'پیوندهای پایین صفحه و خط کپی‌رایت.' },
  home: { label: 'صفحهٔ اصلی', description: 'همهٔ بخش‌های صفحهٔ خانه، به ترتیب.' },
  about: { label: 'درباره من', description: 'سرصفحه، مسیر حرفه‌ای، نقش‌ها و مثال میدانی.' },
  projects: { label: 'پروژه‌ها', description: 'فهرست پروژه‌ها و متن‌های صفحه.' },
  contact: { label: 'تماس', description: 'سرصفحه، برچسب‌های فرم و پیام‌ها.' },
  articles: { label: 'یادداشت‌ها', description: 'سرصفحه و حالت خالی فهرست مقاله‌ها.' },
  misc: { label: 'سایر', description: 'صفحهٔ ۴۰۴ و جعبهٔ نویسنده.' },
} as const

export type GroupKey = keyof typeof GROUPS

export const SECTIONS = {
  // ---------------------------------------------------------------- global
  'site.identity': section({
    key: 'site.identity',
    group: 'global',
    label: 'هویت سایت',
    description: 'در لوگو، عنوان مرورگر، نتایج گوگل، داده‌های ساختاریافته و چت‌بات استفاده می‌شود.',
    fields: [
      { type: 'text', name: 'name', label: 'نام', required: true, max: 80 },
      { type: 'text', name: 'nameLatin', label: 'نام لاتین', required: true, ltr: true, max: 80 },
      { type: 'text', name: 'role', label: 'عنوان حرفه‌ای', required: true, max: 120 },
      { type: 'text', name: 'tagline', label: 'شعار', max: 120 },
      { type: 'text', name: 'positioning', label: 'جملهٔ جایگاه', max: 200 },
      { type: 'textarea', name: 'description', label: 'معرفی کوتاه', max: 300, rows: 3, hint: 'توضیح پیش‌فرض متا برای صفحه‌هایی که توضیح خودشان را ندارند.' },
      { type: 'text', name: 'logoSubline', label: 'خط دوم لوگو', ltr: true, max: 60 },
      { type: 'image', name: 'portrait', label: 'عکس نویسنده (مربع)', hint: 'کنار مقاله‌ها و در جعبهٔ نویسنده.' },
      { type: 'image', name: 'ogImage', label: 'تصویر پیش‌فرض اشتراک‌گذاری', hint: 'خالی بماند تا تصویر خودکار ساخته شود.' },
    ],
    defaults: {
      name: 'ابراهیم زرفشان',
      nameLatin: 'Ebrahim Zarfeshan',
      role: 'مشاور مدیریت کسب‌وکار و هوش مصنوعی',
      tagline: 'سیستم بساز، آزاد باش',
      positioning: 'مشاوری که هم از میدان آمده، هم از آینده',
      description:
        'کمک به مدیران برای رها شدن از درگیری‌های روزمرهٔ اجرایی، از طریق سیستم‌سازی و هوش مصنوعی.',
      logoSubline: 'Management × AI',
      portrait: img('/photos/portrait-square.jpg', 'ابراهیم زرفشان', 600, 600),
      ogImage: noImage,
    },
  }),
  'site.channels': section({
    key: 'site.channels',
    group: 'global',
    label: 'راه‌های ارتباط',
    description: 'در صفحهٔ تماس، آیکون‌های فوتر، داده‌های ساختاریافته و پاسخ‌های چت‌بات.',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'کانال‌ها',
        itemLabel: 'کانال',
        max: 8,
        fields: [
          { type: 'select', name: 'icon', label: 'آیکون', options: ICONS },
          { type: 'text', name: 'label', label: 'نام', required: true, max: 40 },
          { type: 'text', name: 'value', label: 'مقدار نمایشی', required: true, max: 120, hint: 'آنچه روی صفحه نوشته می‌شود.' },
          { type: 'url', name: 'href', label: 'نشانی', required: true },
          { type: 'boolean', name: 'latin', label: 'مقدار لاتین است (چپ‌به‌راست)' },
          { type: 'boolean', name: 'inFooter', label: 'در فوتر هم نشان بده' },
        ],
      },
    ],
    defaults: {
      items: [
        { icon: 'mail', label: 'ایمیل', value: 'ebrahimzarfeshan@gmail.com', href: 'mailto:ebrahimzarfeshan@gmail.com', latin: true, inFooter: true },
        {
          icon: 'linkedin',
          label: 'لینکدین',
          value: 'www.linkedin.com/in/ebrahim-zarfeshan-6bb688423',
          href: 'https://www.linkedin.com/in/ebrahim-zarfeshan-6bb688423',
          latin: true,
          inFooter: true,
        },
        { icon: 'whatsapp', label: 'واتس‌اپ', value: '۰۹۱۷۱۸۱۴۷۷۳', href: 'https://wa.me/989171814773', latin: false, inFooter: true },
        { icon: 'instagram', label: 'اینستاگرام', value: 'mindfullmanager1', href: 'https://instagram.com/mindfullmanager1', latin: true, inFooter: true },
      ],
    },
  }),

  // ---------------------------------------------------------------- header
  'nav.main': section({
    key: 'nav.main',
    group: 'header',
    label: 'منوی اصلی',
    description: 'در هدر، منوی موبایل، فوتر و صفحهٔ ۴۰۴.',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'پیوندها',
        itemLabel: 'پیوند',
        max: 8,
        fields: [
          { type: 'text', name: 'label', label: 'متن', required: true, max: 40 },
          { type: 'url', name: 'href', label: 'مقصد', required: true },
        ],
      },
      { type: 'link', name: 'cta', label: 'دکمهٔ هدر', optional: true },
      { type: 'text', name: 'mobileTitle', label: 'عنوان منوی موبایل', max: 40 },
    ],
    defaults: {
      items: [
        { label: 'خانه', href: '/' },
        { label: 'درباره من', href: '/about' },
        { label: 'پروژه‌ها', href: '/projects' },
        { label: 'یادداشت‌ها', href: '/articles' },
        { label: 'تماس', href: '/contact' },
      ],
      cta: link('شروع گفت‌وگو', '/contact'),
      mobileTitle: 'بخش‌ها',
    },
  }),

  // ---------------------------------------------------------------- footer
  'nav.footer': section({
    key: 'nav.footer',
    group: 'footer',
    label: 'فوتر',
    fields: [
      { type: 'boolean', name: 'showMainNav', label: 'منوی اصلی در فوتر هم بیاید' },
      {
        type: 'list',
        name: 'legal',
        label: 'پیوندهای پایین',
        itemLabel: 'پیوند',
        max: 6,
        fields: [
          { type: 'text', name: 'label', label: 'متن', required: true, max: 40 },
          { type: 'url', name: 'href', label: 'مقصد', required: true },
        ],
      },
      { type: 'text', name: 'copyright', label: 'خط کپی‌رایت', max: 160, hint: '{{year}} سال جاری را می‌نویسد.' },
    ],
    defaults: {
      showMainNav: true,
      legal: [
        { label: 'حریم خصوصی', href: '/privacy' },
        { label: 'شرایط استفاده', href: '/terms' },
      ],
      copyright: '© {{year}} ابراهیم زرفشان. تمام حقوق محفوظ است.',
    },
  }),

  // ---------------------------------------------------------------- home
  'home.seo': section({
    key: 'home.seo',
    group: 'home',
    label: 'سئوی صفحهٔ اصلی',
    fields: SEO_FIELDS,
    defaults: { title: '', description: '', ogImage: noImage },
  }),
  'home.hero': section({
    key: 'home.hero',
    group: 'home',
    label: 'هیرو',
    description: 'تیتر اصلی، جملهٔ زیر آن و دکمه. تصویر متحرک کنار آن ثابت است.',
    fields: [
      { type: 'text', name: 'line1', label: 'خط اول تیتر', required: true, max: 80 },
      { type: 'text', name: 'line2', label: 'خط دوم تیتر', max: 80, hint: 'عبارت بین دو ستاره (*…*) سبز و خط‌دار می‌شود.' },
      { type: 'textarea', name: 'lead', label: 'جملهٔ زیر تیتر', max: 300, rows: 2 },
      { type: 'link', name: 'button', label: 'دکمه', optional: true },
    ],
    defaults: {
      line1: 'مدیریت واقعی،',
      line2: 'با *سیستم‌های هوشمند*',
      lead: 'تجربه کسب‌وکار، سیستم‌سازی و هوش مصنوعی در یک مسیر',
      button: link('مسیر کاری من', '/about'),
    },
  }),
  'home.pillars': section({
    key: 'home.pillars',
    group: 'home',
    label: 'از شفافیت تا هوشمندی',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان بخش', required: true, max: 120 },
      {
        type: 'list',
        name: 'cards',
        label: 'کارت‌ها',
        itemLabel: 'کارت',
        max: 6,
        fields: [
          {
            type: 'select',
            name: 'kind',
            label: 'تصویر',
            options: [
              { value: 'processes', label: 'فرایند (برگه و ذره‌بین)' },
              { value: 'systems', label: 'سیستم (لایه‌ها)' },
              { value: 'ai', label: 'هوش مصنوعی (شبکه)' },
            ],
          },
          { type: 'text', name: 'title', label: 'عنوان', required: true, max: 60 },
          { type: 'text', name: 'tag', label: 'برچسب', max: 30 },
          { type: 'textarea', name: 'text', label: 'توضیح', max: 200, rows: 2 },
        ],
      },
    ],
    defaults: {
      title: 'از شفافیت تا هوشمندی',
      cards: [
        { kind: 'processes', title: 'فرایندها', tag: 'شفاف', text: 'تحلیل و بهینه‌سازی فرایندهای کسب‌وکار' },
        { kind: 'systems', title: 'سیستم‌ها', tag: 'منظم', text: 'طراحی و پیاده‌سازی سیستم‌های کارآمد' },
        { kind: 'ai', title: 'هوش مصنوعی', tag: 'هوشمند', text: 'استفاده کاربردی از هوش مصنوعی در کسب‌وکار واقعی' },
      ],
    },
  }),
  'home.experience': section({
    key: 'home.experience',
    group: 'home',
    label: 'تجربه',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
      { type: 'textarea', name: 'text', label: 'متن', max: 600, rows: 3 },
      { type: 'link', name: 'button', label: 'دکمه', optional: true },
      { type: 'image', name: 'image', label: 'عکس' },
    ],
    defaults: {
      title: 'تجربه‌ای از دل کسب‌وکار واقعی',
      text: 'ترکیبی از تجربه عملی، نگاه سیستمی و استفاده کاربردی از هوش مصنوعی برای رشد کسب‌وکارها.',
      button: link('درباره من', '/about'),
      image: img('/photos/portrait-office.jpg', 'ابراهیم زرفشان پشت میز کار', 1080, 1350),
    },
  }),
  'home.projects': section({
    key: 'home.projects',
    group: 'home',
    label: 'پیش‌نمایش پروژه‌ها',
    description: 'پروژه‌ها خودشان در بخش «پروژه‌ها» ویرایش می‌شوند.',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
      { type: 'link', name: 'button', label: 'دکمه', optional: true },
      { type: 'number', name: 'count', label: 'تعداد پروژه‌های نمایش‌داده‌شده', min: 0, max: 9 },
    ],
    defaults: { title: 'پروژه‌های در حال توسعه', button: link('همهٔ پروژه‌ها', '/projects'), count: 3 },
  }),
  'home.articles': section({
    key: 'home.articles',
    group: 'home',
    label: 'پیش‌نمایش یادداشت‌ها',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
      { type: 'textarea', name: 'lead', label: 'توضیح', max: 300, rows: 2 },
      { type: 'link', name: 'button', label: 'دکمه', optional: true },
      { type: 'number', name: 'count', label: 'تعداد یادداشت‌ها', min: 0, max: 9 },
      { type: 'text', name: 'emptyTitle', label: 'عنوان حالت خالی', max: 120 },
      { type: 'textarea', name: 'emptyText', label: 'متن حالت خالی', max: 300, rows: 2 },
    ],
    defaults: {
      title: 'یادداشت‌ها و تجربه‌ها',
      lead: 'مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها',
      button: link('همهٔ یادداشت‌ها', '/articles'),
      count: 3,
      emptyTitle: 'اولین یادداشت‌ها به‌زودی منتشر می‌شوند',
      emptyText: 'تا آن زمان می‌توانید از مسیر کاری من و پروژه‌های در حال توسعه دیدن کنید.',
    },
  }),
  'home.metrics': section({
    key: 'home.metrics',
    group: 'home',
    label: 'سه عدد',
    description: 'هر عدد از سال شروع حساب می‌شود و هر نوروز خودش به‌روز می‌شود.',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'عددها',
        itemLabel: 'عدد',
        max: 4,
        fields: [
          { type: 'select', name: 'icon', label: 'آیکون', options: ICONS },
          { type: 'number', name: 'startYear', label: 'سال شروع (شمسی)', min: 1300, max: 1500 },
          { type: 'text', name: 'label', label: 'برچسب', required: true, max: 80 },
        ],
      },
    ],
    defaults: {
      items: [
        { icon: 'car', startYear: 1380, label: 'تجربه در صنعت خودرو' },
        { icon: 'user', startYear: 1389, label: 'مدیریت نمایندگی' },
        { icon: 'box', startYear: 1391, label: 'فعالیت در قطعات یدکی خودرو' },
      ],
    },
  }),
  'home.cta': section({
    key: 'home.cta',
    group: 'home',
    label: 'دعوت پایانی',
    fields: CTA_FIELDS,
    defaults: {
      title: 'برای گفت‌وگو آماده‌ام',
      text: 'اگر فکر می‌کنید کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم.',
      primary: link('شروع گفت‌وگو', '/contact'),
      secondary: noLink,
    },
  }),

  // ---------------------------------------------------------------- about
  'about.seo': section({
    key: 'about.seo',
    group: 'about',
    label: 'سئوی درباره من',
    fields: SEO_FIELDS,
    defaults: { title: 'درباره من', description: '', ogImage: noImage },
  }),
  'about.band': section({
    key: 'about.band',
    group: 'about',
    label: 'سرصفحه',
    fields: [
      { type: 'text', name: 'title', label: 'تیتر', required: true, max: 160, hint: INLINE_HINT },
      { type: 'textarea', name: 'lead', label: 'متن زیر تیتر', max: 600, rows: 4, hint: INLINE_HINT },
      { type: 'image', name: 'portrait', label: 'عکس' },
    ],
    defaults: {
      title: 'مشاوری که هم از *میدان* آمده، هم از *آینده*',
      lead: '{{years:1380}} سال تجربه در صنعت خودرو،\n{{years:1389}} سال مدیریت نمایندگی،\nو امروز تمرکز بر سیستم‌سازی و هوش مصنوعی برای کسب‌وکارهای واقعی.',
      portrait: img('/photos/portrait-studio.jpg', 'ابراهیم زرفشان', 997, 1330),
    },
  }),
  'about.figures': section({
    key: 'about.figures',
    group: 'about',
    label: 'سه عدد',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'عددها',
        itemLabel: 'عدد',
        max: 4,
        fields: [
          { type: 'select', name: 'icon', label: 'آیکون', options: ICONS },
          { type: 'number', name: 'startYear', label: 'سال شروع (شمسی)', min: 1300, max: 1500 },
          { type: 'text', name: 'label', label: 'برچسب', required: true, max: 80 },
        ],
      },
    ],
    defaults: {
      items: [
        { icon: 'car', startYear: 1380, label: 'در صنعت خودرو' },
        { icon: 'user', startYear: 1389, label: 'مدیریت نمایندگی' },
        { icon: 'box', startYear: 1391, label: 'فعالیت در قطعات یدکی خودرو' },
      ],
    },
  }),
  'about.turning': section({
    key: 'about.turning',
    group: 'about',
    label: 'نقطهٔ عطف',
    fields: [
      { type: 'text', name: 'badge', label: 'برچسب', max: 40 },
      { type: 'textarea', name: 'title', label: 'تیتر', required: true, max: 240, rows: 2 },
      { type: 'textarea', name: 'before', label: 'بند اول', max: 800, rows: 3 },
      { type: 'text', name: 'emphasis', label: 'جملهٔ پررنگ', max: 120 },
      { type: 'textarea', name: 'after', label: 'بند پایانی', max: 800, rows: 3 },
    ],
    defaults: {
      badge: 'نقطه عطف',
      title: 'وقتی یک مشکل با آدم‌های مختلف تکرار می‌شود، دیگر فقط مشکل آدم‌ها نیست.',
      before:
        'سال‌ها فکر می‌کردم بسیاری از مشکلات با نیروی بهتر حل می‌شوند. اما وقتی همان مسئله در بخش‌های مختلف و با افراد مختلف تکرار شد، فهمیدم:',
      emphasis: 'مشکل از سیستم است.',
      after: 'از همان‌جا مسیر من از مدیریت روزمره به سمت سیستم‌سازی و بعد استفاده کاربردی از هوش مصنوعی تغییر کرد.',
    },
  }),
  'about.path': section({
    key: 'about.path',
    group: 'about',
    label: 'مسیر حرفه‌ای',
    description: 'چت‌بات سایت هم همین مسیر را می‌خواند.',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان بخش', required: true, max: 120 },
      {
        type: 'list',
        name: 'milestones',
        label: 'ایستگاه‌ها',
        itemLabel: 'ایستگاه',
        max: 12,
        fields: [
          { type: 'number', name: 'year', label: 'سال (شمسی)', min: 1300, max: 1500 },
          { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
          { type: 'textarea', name: 'body', label: 'توضیح', max: 300, rows: 2 },
        ],
      },
      { type: 'text', name: 'todayTitle', label: 'عنوان ایستگاه آخر', max: 40 },
      { type: 'textarea', name: 'todayBody', label: 'متن ایستگاه آخر', max: 300, rows: 2 },
    ],
    defaults: {
      title: 'مسیر حرفه‌ای من',
      milestones: [
        { year: 1380, title: 'ورود به صنعت خودرو', body: 'شروع فعالیت در فروش خودرو و قطعات یدکی خودرو' },
        { year: 1389, title: 'مدیریت نمایندگی سایپا', body: 'مسئولیت کامل فروش، خدمات، تیم و عملیات نمایندگی' },
        { year: 1391, title: 'پخش قطعات یدکی خودرو', body: 'ورود جدی‌تر به زنجیره تأمین، انبار و شبکه توزیع' },
        { year: 1397, title: 'تأسیس باشگاه ورزشی', body: 'تجربه ساخت و مدیریت یک مجموعه در حوزه‌ای متفاوت' },
      ],
      todayTitle: 'امروز',
      todayBody: 'ترکیب تجربه مدیریتی، سیستم‌سازی و هوش مصنوعی',
    },
  }),
  'about.roles': section({
    key: 'about.roles',
    group: 'about',
    label: 'نقش‌های فعلی',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان بخش', required: true, max: 120 },
      {
        type: 'list',
        name: 'items',
        label: 'نقش‌ها',
        itemLabel: 'نقش',
        max: 12,
        fields: [
          { type: 'text', name: 'title', label: 'نقش', required: true, max: 120 },
          { type: 'text', name: 'detail', label: 'از کی', max: 40 },
        ],
      },
    ],
    defaults: {
      title: 'نقش‌های فعلی من',
      items: [
        { title: 'مدیر نمایندگی سایپا', detail: 'از ۱۳۸۹' },
        { title: 'فعال در فروش و پخش قطعات یدکی خودرو', detail: 'از ۱۳۹۱' },
        { title: 'رئیس هیئت شطرنج لارستان', detail: 'در حال حاضر' },
        { title: 'مؤسس باشگاه ورزشی', detail: 'از ۱۳۹۷' },
        { title: 'فعال در حوزه مدیریت، سیستم‌سازی و هوش مصنوعی', detail: 'امروز' },
      ],
    },
  }),
  'about.credentials': section({
    key: 'about.credentials',
    group: 'about',
    label: 'مدارک و دوره‌ها',
    description: 'روی صفحه دیده نمی‌شود؛ به داده‌های ساختاریافتهٔ گوگل و چت‌بات می‌رسد.',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'مدارک',
        itemLabel: 'مدرک',
        max: 12,
        fields: [
          { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
          { type: 'text', name: 'note', label: 'یادداشت', max: 80, hint: 'مثلاً «در حال گذراندن». مدرک یادداشت‌دار به گوگل اعلام نمی‌شود.' },
        ],
      },
    ],
    defaults: {
      items: [
        { title: 'MBA', note: '' },
        { title: 'DBA', note: '' },
        { title: 'دورهٔ تخصصی مارکتینگ', note: '' },
        { title: 'دورهٔ حرفه‌ای هوش مصنوعی', note: 'در حال گذراندن' },
      ],
    },
  }),
  'about.learning': section({
    key: 'about.learning',
    group: 'about',
    label: 'یادگیری و توسعه',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
      { type: 'textarea', name: 'text', label: 'متن', max: 500, rows: 3 },
      {
        type: 'list',
        name: 'keywords',
        label: 'کلیدواژه‌ها',
        itemLabel: 'کلیدواژه',
        max: 12,
        fields: [{ type: 'text', name: 'text', label: 'کلیدواژه', required: true, max: 40 }],
      },
    ],
    defaults: {
      title: 'یادگیری و توسعه',
      text: 'برای من یادگیری زمانی ارزش دارد که بتوان آن را در یک کسب‌وکار واقعی به کار گرفت.',
      keywords: ['مدیریت', 'سیستم‌سازی', 'مذاکره', 'بازاریابی', 'هوش مصنوعی'].map((text) => ({ text })),
    },
  }),
  'about.example': section({
    key: 'about.example',
    group: 'about',
    label: 'مثال میدانی',
    description: 'سه کارت مسئله، اقدام، نتیجه. چت‌بات هم همین را نقل می‌کند.',
    fields: [
      { type: 'text', name: 'title', label: 'عنوان', required: true, max: 160 },
      { type: 'text', name: 'problemLabel', label: 'برچسب کارت اول', max: 40 },
      { type: 'textarea', name: 'problem', label: 'مسئله', max: 400, rows: 2 },
      { type: 'text', name: 'actionLabel', label: 'برچسب کارت دوم', max: 40 },
      { type: 'textarea', name: 'action', label: 'کاری که کردیم', max: 400, rows: 2 },
      { type: 'text', name: 'resultLabel', label: 'برچسب کارت سوم', max: 40 },
      { type: 'textarea', name: 'result', label: 'نتیجه', max: 400, rows: 2 },
    ],
    defaults: {
      title: 'وقتی تشویق را با اندازه‌گیری عوض کردیم',
      problemLabel: 'مسئله',
      problem: 'عملکرد خوب تعریف مشخصی نداشت و ارزیابی‌ها سلیقه‌ای بود.',
      actionLabel: 'کاری که کردیم',
      action: 'شاخص‌های عملکرد را مشخص کردیم و ارزیابی را به یک سیستم قابل اندازه‌گیری تبدیل کردیم.',
      resultLabel: 'نتیجه',
      result: 'تصمیم‌گیری شفاف‌تر شد و عملکرد از «حس» به «داده» نزدیک‌تر شد.',
    },
  }),
  'about.cta': section({
    key: 'about.cta',
    group: 'about',
    label: 'دعوت پایانی',
    fields: CTA_FIELDS,
    defaults: {
      title: 'برای گفت‌وگو آماده‌ام',
      text: 'اگر کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم.',
      primary: link('شروع گفت‌وگو', '/contact'),
      secondary: link('پروژه‌ها را ببینید', '/projects'),
    },
  }),

  // ---------------------------------------------------------------- projects
  'projects.seo': section({
    key: 'projects.seo',
    group: 'projects',
    label: 'سئوی پروژه‌ها',
    fields: SEO_FIELDS,
    defaults: {
      title: 'پروژه‌ها',
      description: 'راهکارهایی برای مدیریت هوشمندتر کسب‌وکارها — پروژه‌هایی که در حال توسعه‌اند.',
      ogImage: noImage,
    },
  }),
  'projects.band': section({
    key: 'projects.band',
    group: 'projects',
    label: 'سرصفحه',
    fields: [
      { type: 'text', name: 'title', label: 'تیتر', required: true, max: 160, hint: INLINE_HINT },
      { type: 'textarea', name: 'lead', label: 'متن زیر تیتر', max: 400, rows: 2 },
    ],
    defaults: { title: '*پروژه‌های در حال توسعه*', lead: 'راهکارهایی برای مدیریت هوشمندتر کسب‌وکارها' },
  }),
  'projects.items': section({
    key: 'projects.items',
    group: 'projects',
    label: 'فهرست پروژه‌ها',
    description: 'ترتیب همین‌جا ترتیب صفحه است. پروژهٔ بی‌تصویر یکی از طرح‌های آماده را نشان می‌دهد.',
    fields: [
      {
        type: 'list',
        name: 'items',
        label: 'پروژه‌ها',
        itemLabel: 'پروژه',
        max: 24,
        fields: [
          { type: 'text', name: 'slug', label: 'شناسه', required: true, ltr: true, max: 60, hint: 'حروف کوچک لاتین و خط تیره.' },
          { type: 'text', name: 'title', label: 'عنوان', required: true, max: 120 },
          { type: 'textarea', name: 'text', label: 'توضیح', max: 400, rows: 2 },
          { type: 'text', name: 'status', label: 'وضعیت', max: 40 },
          { type: 'image', name: 'image', label: 'تصویر یا اسکرین‌شات' },
          {
            type: 'select',
            name: 'fit',
            label: 'چیدمان تصویر',
            options: [
              { value: 'cover', label: 'پر کردن قاب' },
              { value: 'contain', label: 'کامل در قاب (برای عکس عمودی گوشی)' },
            ],
          },
          {
            type: 'select',
            name: 'mock',
            label: 'طرح جایگزین وقتی تصویر نیست',
            options: [
              { value: 'performance', label: 'داشبورد ارزیابی' },
              { value: 'tama', label: 'نوبت‌دهی' },
              { value: 'intelligence', label: 'هوش سازمانی' },
            ],
          },
          { type: 'link', name: 'link', label: 'پیوند پروژه', optional: true },
          { type: 'boolean', name: 'hidden', label: 'پنهان' },
        ],
      },
    ],
    defaults: {
      items: [
        {
          slug: 'performance-evaluation',
          title: 'سیستم ارزیابی عملکرد',
          text: 'سیستمی برای ارزیابی شفاف‌تر، بازخورد مؤثرتر و تصمیم‌گیری بهتر برای رشد تیم‌ها',
          status: 'در حال توسعه',
          image: noImage,
          fit: 'cover',
          mock: 'performance',
          link: noLink,
          hidden: false,
        },
        {
          slug: 'tama',
          title: 'TAMA | نوبت‌دهی هوشمند نمایندگی خودرو',
          text: 'مدیریت بهتر مراجعات، ظرفیت و منابع با داشبورد تحلیلی مدیریتی',
          status: 'در حال توسعه',
          image: noImage,
          fit: 'cover',
          mock: 'tama',
          link: noLink,
          hidden: false,
        },
        {
          slug: 'organizational-intelligence',
          title: 'اپلیکیشن هوش سازمانی',
          text: 'تبدیل داده‌ها و گزارش‌های پراکنده به بینش مدیریتی برای تصمیم‌گیری',
          status: 'در حال توسعه',
          image: noImage,
          fit: 'cover',
          mock: 'intelligence',
          link: noLink,
          hidden: false,
        },
        {
          slug: 'budgetyar',
          title: 'بودجه‌یار | سامانه بودجه‌بندی سالیانه',
          text: 'مدیریت مالی و بودجهٔ نمایندگی‌ها؛ تصمیم‌های بهتر با اطلاعات دقیق‌تر',
          status: 'در حال توسعه',
          image: img('/projects/budget-yar.webp', 'صفحهٔ ورود سامانهٔ بودجه‌یار برای نمایندگی خودرو', 1400, 933),
          fit: 'cover',
          mock: 'performance',
          link: noLink,
          hidden: false,
        },
        {
          slug: 'gam',
          title: 'گام | پلنر',
          text: 'پلنر برای هدف‌ها، عادت‌ها و برنامه‌ریزی روزانه؛ هر روز، یک گام نزدیک‌تر',
          status: 'در حال توسعه',
          image: img('/projects/gam.webp', 'صفحهٔ آغاز اپلیکیشن گام روی گوشی', 554, 1100),
          fit: 'contain',
          mock: 'performance',
          link: noLink,
          hidden: false,
        },
      ],
    },
  }),
  'projects.cta': section({
    key: 'projects.cta',
    group: 'projects',
    label: 'دعوت پایانی',
    fields: CTA_FIELDS,
    defaults: {
      title: 'اگر ایده یا چالشی در کسب‌وکارتان دارید، می‌توانیم با هم بررسی کنیم.',
      text: '',
      primary: link('تماس با من', '/contact'),
      secondary: noLink,
    },
  }),

  // ---------------------------------------------------------------- contact
  'contact.seo': section({
    key: 'contact.seo',
    group: 'contact',
    label: 'سئوی تماس',
    fields: SEO_FIELDS,
    defaults: {
      title: 'تماس',
      description: 'برای گفت‌وگو آماده‌ام — ایمیل، لینکدین، واتس‌اپ، اینستاگرام یا فرم پیام.',
      ogImage: noImage,
    },
  }),
  'contact.page': section({
    key: 'contact.page',
    group: 'contact',
    label: 'متن‌های صفحه',
    description: 'کانال‌های ارتباطی در «هویت و تماس» ویرایش می‌شوند.',
    fields: [
      { type: 'text', name: 'title', label: 'تیتر', required: true, max: 160, hint: INLINE_HINT },
      { type: 'textarea', name: 'lead', label: 'متن زیر تیتر', max: 500, rows: 3 },
      { type: 'text', name: 'channelsTitle', label: 'عنوان کادر راه‌های ارتباط', max: 80 },
      { type: 'text', name: 'formTitle', label: 'عنوان کادر فرم', max: 80 },
      { type: 'textarea', name: 'formIntro', label: 'جملهٔ زیر عنوان فرم', max: 300, rows: 2 },
      { type: 'text', name: 'directTitle', label: 'عنوان کادر پایین', max: 120 },
      { type: 'textarea', name: 'directText', label: 'متن کادر پایین', max: 600, rows: 3, hint: INLINE_HINT },
    ],
    defaults: {
      title: 'برای گفت‌وگو آماده‌ام',
      lead: 'اگر فکر می‌کنید کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم.',
      channelsTitle: 'راه‌های ارتباط',
      formTitle: 'ارسال پیام',
      formIntro: 'چند خط بنویسید؛ خودم می‌خوانم و جواب می‌دهم.',
      directTitle: 'ترجیح می‌دهید مستقیم صحبت کنیم؟',
      directText:
        'می‌توانید از راه‌های ارتباطی بالا با من در تماس باشید. اگر مسئله‌ای را می‌خواهید با جزئیات بیشتر مطرح کنید، [فرم درخواست مشاوره](/consult) را پر کنید.',
    },
  }),
  'contact.form': section({
    key: 'contact.form',
    group: 'contact',
    label: 'فرم پیام',
    description: 'برچسب‌ها، راهنماها، دکمه و پیام موفقیت. موضوع‌های فرم در کد ثابت‌اند چون سرور آن‌ها را بررسی می‌کند.',
    fields: [
      { type: 'text', name: 'nameLabel', label: 'برچسب نام', required: true, max: 40 },
      { type: 'text', name: 'namePlaceholder', label: 'راهنمای نام', max: 80 },
      { type: 'text', name: 'contactLabel', label: 'برچسب راه ارتباطی', required: true, max: 40 },
      { type: 'text', name: 'contactPlaceholder', label: 'راهنمای راه ارتباطی', max: 80 },
      { type: 'text', name: 'subjectLabel', label: 'برچسب موضوع', required: true, max: 40 },
      { type: 'text', name: 'subjectPlaceholder', label: 'گزینهٔ خالی موضوع', max: 40 },
      { type: 'text', name: 'messageLabel', label: 'برچسب پیام', required: true, max: 40 },
      { type: 'text', name: 'messagePlaceholder', label: 'راهنمای پیام', max: 120 },
      { type: 'text', name: 'submit', label: 'متن دکمهٔ ارسال', required: true, max: 40 },
      { type: 'text', name: 'successTitle', label: 'عنوان پیام موفقیت', max: 80 },
      { type: 'textarea', name: 'successText', label: 'متن پیام موفقیت', max: 300, rows: 2 },
    ],
    defaults: {
      nameLabel: 'نام',
      namePlaceholder: 'نام و نام خانوادگی',
      contactLabel: 'راه ارتباطی',
      contactPlaceholder: 'ایمیل یا شماره تماس',
      subjectLabel: 'موضوع',
      subjectPlaceholder: 'انتخاب کنید',
      messageLabel: 'پیام',
      messagePlaceholder: 'توضیح کوتاهی درباره درخواست خود بنویسید…',
      submit: 'ارسال پیام',
      successTitle: 'پیامت رسید',
      successText: 'پیام را می‌خوانم و خودم جواب می‌دهم.',
    },
  }),

  // ---------------------------------------------------------------- articles
  'articles.seo': section({
    key: 'articles.seo',
    group: 'articles',
    label: 'سئوی فهرست یادداشت‌ها',
    fields: SEO_FIELDS,
    defaults: {
      title: 'یادداشت‌ها و تجربه‌ها',
      description: 'مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها',
      ogImage: noImage,
    },
  }),
  'articles.index': section({
    key: 'articles.index',
    group: 'articles',
    label: 'سرصفحه و حالت خالی',
    fields: [
      { type: 'text', name: 'title', label: 'تیتر', required: true, max: 160, hint: INLINE_HINT },
      { type: 'textarea', name: 'lead', label: 'متن زیر تیتر', max: 400, rows: 2 },
      { type: 'text', name: 'emptyTitle', label: 'عنوان حالت خالی', max: 120 },
      { type: 'textarea', name: 'emptyText', label: 'متن حالت خالی', max: 300, rows: 2 },
      { type: 'link', name: 'emptyAction', label: 'دکمهٔ حالت خالی', optional: true },
      { type: 'text', name: 'relatedTitle', label: 'عنوان «خواندن بعدی» زیر مقاله', max: 60 },
    ],
    defaults: {
      title: 'یادداشت‌ها و تجربه‌ها',
      lead: 'مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها',
      emptyTitle: 'هنوز یادداشتی منتشر نشده',
      emptyText: 'اولین یادداشت‌ها به‌زودی اینجا می‌آیند.',
      emptyAction: link('درباره من', '/about'),
      relatedTitle: 'خواندن بعدی',
    },
  }),

  // ---------------------------------------------------------------- misc
  'misc.author': section({
    key: 'misc.author',
    group: 'misc',
    label: 'جعبهٔ نویسنده زیر مقاله',
    fields: [
      { type: 'text', name: 'eyebrow', label: 'برچسب', max: 40 },
      { type: 'textarea', name: 'bio', label: 'معرفی', max: 400, rows: 3, hint: 'خالی بماند تا «معرفی کوتاه» هویت سایت بیاید.' },
      { type: 'link', name: 'primary', label: 'پیوند اول', optional: true },
      { type: 'link', name: 'secondary', label: 'پیوند دوم', optional: true },
    ],
    defaults: {
      eyebrow: 'نویسنده',
      bio: '',
      primary: link('دربارهٔ من ←', '/about'),
      secondary: link('عضویت در خبرنامه ←', '/newsletter'),
    },
  }),
  'misc.notFound': section({
    key: 'misc.notFound',
    group: 'misc',
    label: 'صفحهٔ ۴۰۴',
    fields: [
      { type: 'text', name: 'eyebrow', label: 'برچسب', max: 20 },
      { type: 'text', name: 'title', label: 'تیتر', required: true, max: 120 },
      { type: 'textarea', name: 'lead', label: 'متن', max: 300, rows: 2 },
      { type: 'link', name: 'primary', label: 'دکمهٔ اول', optional: true },
      { type: 'link', name: 'secondary', label: 'دکمهٔ دوم', optional: true },
      { type: 'text', name: 'navIntro', label: 'جملهٔ بالای پیوندها', max: 80 },
    ],
    defaults: {
      eyebrow: '۴۰۴',
      title: 'این صفحه وجود ندارد',
      lead: 'شاید نشانی اشتباه تایپ شده، یا نوشته‌ای که دنبالش بودی جابه‌جا شده.',
      primary: link('همهٔ مقالات', '/articles'),
      secondary: link('صفحهٔ اصلی', '/'),
      navIntro: 'یا از اینجا شروع کن:',
    },
  }),
} as const

export type SectionKey = keyof typeof SECTIONS
export type SectionValues<K extends SectionKey> = (typeof SECTIONS)[K]['defaults']

export function isSectionKey(key: string): key is SectionKey {
  return Object.prototype.hasOwnProperty.call(SECTIONS, key)
}

/** Sections in the order the admin lists them. */
export function sectionsByGroup(): { group: GroupKey; label: string; description: string; sections: { key: SectionKey; label: string; description?: string }[] }[] {
  return (Object.keys(GROUPS) as GroupKey[]).map((group) => ({
    group,
    label: GROUPS[group].label,
    description: GROUPS[group].description,
    sections: (Object.values(SECTIONS) as { key: SectionKey; group: GroupKey; label: string; description?: string }[])
      .filter((s) => s.group === group)
      .map((s) => ({ key: s.key, label: s.label, description: s.description })),
  }))
}
