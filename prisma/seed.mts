/**
 * Seeds topics and the six sample articles.
 *
 * Every article is written DRAFT and stays DRAFT. They are drawn from the topic
 * list in the brief, not from published work, and each body opens with a marker
 * saying so. Nothing here should reach the public site until it has been
 * rewritten in Ebrahim's own voice with his own examples.
 *
 *   npm run db:seed
 *
 * Safe to re-run: everything upserts on the natural key.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

process.loadEnvFile('.env')

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const CONTENT_DIR = join(import.meta.dirname, 'seed-content')

const topics = [
  {
    slug: 'system-building',
    name: 'سیستم‌سازی',
    description: 'نوشتن فرایند، تعریف مرز تصمیم، و کم کردن وابستگی کار به حافظهٔ آدم‌ها.',
  },
  {
    slug: 'ai',
    name: 'هوش مصنوعی',
    description: 'استفادهٔ عملی از هوش مصنوعی در تیم کوچک — بعد از اینکه فرایند نوشته شد.',
  },
  {
    slug: 'team',
    name: 'مدیریت تیم',
    description: 'استخدام، آموزش، و انتقال دانش طوری که رفتن یک نفر شروع دوباره نباشد.',
  },
  {
    slug: 'metrics',
    name: 'شاخص‌های عملیاتی',
    description: 'انتخاب عددی که تصمیم عوض می‌کند، به‌جای داشبوردی که فقط گزارش می‌دهد.',
  },
]

type SeedArticle = {
  slug: string
  file: string
  title: string
  excerpt: string
  topic: string
  publishedAt: string
  featured?: boolean
}

const articles: SeedArticle[] = [
  {
    slug: 'system-building-for-the-overloaded-manager',
    file: '01-system-building-for-the-overloaded-manager.md',
    title: 'مدیری که وقت ندارد، بیشتر از همه به سیستم نیاز دارد',
    excerpt:
      'وقتی روزت با اطفای حریق پر می‌شود، اولین چیزی که حذف می‌کنی ساختن سیستم است — و دقیقاً به همین دلیل فردا هم روزت با اطفای حریق پر می‌شود. راه بیرون آمدن از این حلقه.',
    topic: 'system-building',
    publishedAt: '2026-08-10',
    featured: true,
  },
  {
    slug: 'ai-for-small-teams',
    file: '02-ai-for-small-teams.md',
    title: 'هوش مصنوعی برای تیم پنج‌نفره، نه برای شرکت پانصد‌نفره',
    excerpt:
      'بیشتر نوشته‌های هوش مصنوعی برای سازمان‌هایی نوشته شده که واحد داده دارند. اگر تیمت پنج نفر است، نقطهٔ شروع جای دیگری است.',
    topic: 'ai',
    publishedAt: '2026-07-28',
  },
  {
    slug: 'documenting-a-process-that-lives-in-your-head',
    file: '03-documenting-a-process-that-lives-in-your-head.md',
    title: 'فرایندی که فقط در سر توست، دارایی نیست — ریسک است',
    excerpt:
      'مستندسازی معمولاً شکست می‌خورد چون آدم‌ها می‌خواهند همه‌چیز را یک‌جا بنویسند. روش کوچک‌تری هست که دوام می‌آورد.',
    topic: 'system-building',
    publishedAt: '2026-07-14',
  },
  {
    slug: 'founder-dependency',
    file: '04-founder-dependency.md',
    title: 'اگر فردا مریض شوی، کسب‌وکارت چند روز دوام می‌آورد؟',
    excerpt:
      'یک سؤال ساده که جوابش وضعیت واقعی کسب‌وکارت را نشان می‌دهد — و چهار جایی که وابستگی به مؤسس معمولاً پنهان می‌شود.',
    topic: 'system-building',
    publishedAt: '2026-06-30',
  },
  {
    slug: 'hiring-and-onboarding-without-starting-over',
    file: '05-hiring-and-onboarding-without-starting-over.md',
    title: 'چرا با رفتن هر نیرو، از صفر شروع می‌کنی',
    excerpt:
      'مشکل استخدام نیست. مشکل این است که دانش کار در آدم ذخیره شده، نه در سیستم. چطور آموزش را از حافظهٔ افراد بیرون بیاوریم.',
    topic: 'team',
    publishedAt: '2026-06-16',
  },
  {
    slug: 'operational-metrics-that-earn-their-place',
    file: '06-operational-metrics-that-earn-their-place.md',
    title: 'کدام عدد را باید هر هفته نگاه کنی',
    excerpt:
      'داشبوردی که سی شاخص دارد، هیچ شاخصی ندارد. معیار انتخاب عددی که واقعاً تصمیم عوض می‌کند.',
    topic: 'metrics',
    publishedAt: '2026-06-02',
  },
]

/**
 * Persian reading speed runs slower than English; 200 wpm is a reasonable
 * working figure. ZWNJ (U+200C) joins compound words — splitting on it would
 * inflate the count, so it is treated as part of the word.
 */
function readingMinutes(text: string): number {
  const words = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[#*`>]/g, '')
    .trim()
    .split(/[\s ]+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

async function main() {
  for (const t of topics) {
    await db.topic.upsert({ where: { slug: t.slug }, update: t, create: t })
  }
  console.log(`topics: ${topics.length}`)

  for (const a of articles) {
    const body = readFileSync(join(CONTENT_DIR, a.file), 'utf8')
    const minutes = readingMinutes(body)

    const data = {
      title: a.title,
      excerpt: a.excerpt,
      body,
      readingMinutes: minutes,
      featured: a.featured ?? false,
      // Published so the site can be reviewed end to end. The DRAFT marker
      // stays in the body and the article page renders it as a visible notice,
      // so no reader can mistake a sample for finished work.
      status: 'PUBLISHED' as const,
      publishedAt: new Date(a.publishedAt),
      seoTitle: a.title,
      seoDescription: a.excerpt,
      topics: { set: [], connect: [{ slug: a.topic }] },
    }

    await db.article.upsert({
      where: { slug: a.slug },
      update: data,
      create: { slug: a.slug, ...data, topics: { connect: [{ slug: a.topic }] } },
    })
    console.log(`  ${a.slug}  ${minutes} min`)
  }

  const drafts = await db.article.count({ where: { status: 'DRAFT' } })
  const published = await db.article.count({ where: { status: 'PUBLISHED' } })
  console.log(`\narticles: ${drafts} draft, ${published} published`)
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
