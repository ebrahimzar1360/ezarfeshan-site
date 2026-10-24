/**
 * Import the approved ChatGPT Ads article into the existing database-backed CMS.
 * This script is intentionally NOT wired to build, migrations, or db:seed.
 * Run once in the deployment environment after reviewing the PR:
 *   node --experimental-strip-types tools/content/import-chatgpt-ads.mts
 *
 * Idempotent on slug; will not overwrite an article that already exists.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

try { process.loadEnvFile('.env') } catch { /* production may inject DATABASE_URL */ }
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required')
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const slug = 'chatgpt-ads-business-opportunities-2026'
const title = 'تبلیغات در ChatGPT به ۸۹ کشور رسید؛ فرصت تازه‌ای برای بازاریابی کسب‌وکارها'
const excerpt = 'تبلیغات ChatGPT به ۸۹ کشور گسترش یافته است. این تحول چه فرصت‌هایی برای بازاریابی ایجاد می‌کند و مدیران کسب‌وکار چگونه باید آماده شوند؟'
const source = join(import.meta.dirname, '../../content/pending/chatgpt-ads-business-opportunities-2026.md')
const raw = readFileSync(source, 'utf8')
const body = raw.replace(/<!--\s*[\s\S]*?-->/g, '').replace(/^# [^\n]+\n+/, '').trim()
const readingMinutes = Math.max(1, Math.ceil(body.split(/\s+/).length / 200))

try {
  const existing = await db.article.findUnique({ where: { slug }, select: { id: true, status: true } })
  if (existing) {
    console.log('Article already exists; leaving it unchanged:', slug, existing.status)
  } else {
    const topic = await db.topic.findUnique({ where: { slug: 'ai' }, select: { id: true } })
    if (!topic) throw new Error('Missing CMS topic ai; create it before importing.')
    const article = await db.article.create({
      data: {
        slug, title, excerpt, body, readingMinutes,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        seoTitle: 'تبلیغات ChatGPT در ۸۹ کشور؛ فرصت جدید کسب‌وکارها',
        seoDescription: 'تبلیغات ChatGPT به ۸۹ کشور گسترش یافت. بررسی فرصت‌های بازاریابی، محدودیت دسترسی در ایران و کاربرد این تحول برای مدیران کسب‌وکار.',
        coverAlt: 'گسترش تبلیغات ChatGPT و فرصت‌های بازاریابی هوشمند برای کسب‌وکارها',
        topics: { connect: [{ id: topic.id }] },
      },
    })
    console.log('Created published article:', article.id, '/articles/' + slug)
    console.log('If your deployment caches pages, revalidate /articles and /articles/' + slug)
  }
} finally {
  await db.$disconnect()
}
