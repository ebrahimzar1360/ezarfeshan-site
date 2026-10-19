/**
 * The owner's image pack (public/site-images/, 1405/07/27): generated,
 * illustrative photographs, all 16:9 WebP, with the alt text the pack ships.
 * None of them shows the owner's face and none is a screenshot of a real
 * product — project pictures are marked «تصویر مفهومی» where they appear.
 *
 * Where each one goes is decided here, so a page only asks for its slot:
 *   pages     the inner-page mastheads (PageBand / PageHeader aside)
 *   topics    the topic pages' mastheads
 *   projects  stands in for a project with no picture of its own in the CMS;
 *             a screenshot uploaded in the admin always wins
 *
 * Not used, on purpose: budget-planning and gam-journey-optional. بودجه‌یار
 * and گام keep their approved designs, and a second picture on the same card
 * would only compete with them. home-hero is not on the homepage either: the
 * hero is the 3D monogram the owner asked for (see docs/OPEN-QUESTIONS.md).
 */
export type SitePhoto = {
  readonly src: string
  readonly alt: string
  readonly width: number
  readonly height: number
}

const photo = (name: string, alt: string, width: number, height: number): SitePhoto => ({
  src: `/site-images/${name}.webp`,
  alt,
  width,
  height,
})

export const PHOTOS = {
  homeHero: photo('home-hero', 'از آشفتگی عملیات روزمره تا مدیریت داده‌محور و منظم', 1536, 864),
  aboutWorkplace: photo('about-workplace', 'فضای مدیریت واقعی در کنار تعمیرگاه و خدمات خودرویی', 1536, 864),
  systems: photo('systems-four-layers', 'شبکه‌ای فیزیکی از اجزای فرایند و داده، متصل به یکدیگر', 1536, 864),
  performance: photo('performance-evaluation', 'کار با نمودارهای عملکرد و شاخص‌های مدیریتی روی لپ‌تاپ', 510, 287),
  tama: photo('tama-auto-service', 'خدمات فنی خودرو و مدیریت ظرفیت تعمیرگاه', 638, 359),
  intelligence: photo('organizational-intelligence', 'هوش و یادگیری سازمانی با استعاره کتاب و ایده‌های متصل', 508, 286),
  articles: photo('articles-learning', 'کتاب‌ها و نور ایده‌ها در فضای مطالعه حرفه‌ای', 509, 286),
  contact: photo('contact-connect', 'ابزار ارتباط و شبکه‌سازی در فضایی واقعی و انتزاعی', 509, 286),
  leadership: photo('leadership-strategy', 'دست مدیر بر مهره شطرنج و مفهوم تصمیم راهبردی', 551, 310),
  growth: photo('growth-journey', 'پله‌های پیوسته در مسیر پیشرفت شغلی', 504, 284),
  newsletter: photo('newsletter-focus', 'فضای آرام کاری و لامپ روشن نماد ایده', 551, 310),
} as const

/** inner pages that carry a picture in their masthead or body */
export const PAGE_PHOTOS = {
  about: PHOTOS.aboutWorkplace,
  projects: PHOTOS.homeHero,
  articles: PHOTOS.articles,
  contact: PHOTOS.contact,
  newsletter: PHOTOS.newsletter,
} as const

const TOPIC_PHOTOS: Record<string, SitePhoto> = {
  'system-building': PHOTOS.systems,
  team: PHOTOS.leadership,
  'personal-growth': PHOTOS.growth,
  ai: PHOTOS.intelligence,
}

const PROJECT_PHOTOS: Record<string, SitePhoto> = {
  'performance-evaluation': PHOTOS.performance,
  tama: PHOTOS.tama,
  'organizational-intelligence': PHOTOS.intelligence,
}

/** the masthead picture of a topic page, if its topic has one */
export function topicPhoto(slug: string): SitePhoto | null {
  return TOPIC_PHOTOS[slug] ?? null
}

/** the illustrative picture for a project the CMS gives no image */
export function projectPhoto(slug: string): SitePhoto | null {
  return PROJECT_PHOTOS[slug] ?? null
}
