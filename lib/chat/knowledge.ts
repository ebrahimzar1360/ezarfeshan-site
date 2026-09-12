import { db } from '@/lib/db'
import {
  credentials,
  currentRoles,
  fa,
  fieldExample,
  milestones,
  stats,
  yearsSince,
} from '@/lib/content/bio'
import { site, socials } from '@/lib/site'

/**
 * The chatbot's entire world. Nothing here is fetched from anywhere but this
 * codebase and this database — no outside knowledge ever enters the prompt.
 *
 * Two layers:
 *   1. Static facts — identity, bio, consult pricing/policy, contact. Cheap,
 *      always included, and the reason the assistant can answer "who is this"
 *      or "how much does it cost" without a database round trip.
 *   2. Retrieved articles — the same pg_trgm similarity query api/search uses,
 *      run against the visitor's message so article-specific questions pull in
 *      the relevant published pieces instead of guessing from a title alone.
 *
 * If retrieval finds nothing, the static layer alone is still enough to answer
 * "who are you" / "what do you do" / "what does this cost" — the questions a
 * first-time visitor actually asks.
 */

function staticFacts(): string {
  const roles = currentRoles.map((r) => `- ${r.title} (${r.detail})`).join('\n')
  const creds = credentials.map((c) => `- ${c.title}${c.note ? ` — ${c.note}` : ''}`).join('\n')
  const path = milestones
    .map((m) => `- ${fa(m.year)}: ${m.title} — ${m.body}`)
    .join('\n')
  const figures = stats.map((s) => `- ${s.value} ${s.unit} ${s.label}`).join('\n')
  const socialLines = socials.map((s) => `- ${s.label}: ${s.href}`).join('\n')

  return `
درباره سایت و صاحب آن:
نام: ${site.name} (${site.nameLatin})
نقش: ${site.role}
جمله‌ی موقعیت‌یابی: ${site.positioning}
توضیح کوتاه: ${site.description}

آمار کلیدی:
${figures}

نقش‌های فعلی:
${roles}

مدارک و دوره‌ها:
${creds}

مسیر حرفه‌ای:
${path}

یک مثال میدانی (${fieldExample.title}):
مسئله: ${fieldExample.problem}
اقدام: ${fieldExample.action}
نتیجه: ${fieldExample.result}

مشاوره و قیمت‌گذاری:
- اولین گفت‌وگو رایگان است.
- بیشتر پروژه‌ها در بازه‌ی ۵۰ تا ۱۵۰ میلیون تومان جمع می‌شوند؛ کارهای کوچک‌تر زیر آن و مجموعه‌های بزرگ‌تر بالای آن قرار می‌گیرند. رقم دقیق فقط بعد از شنیدن دامنه‌ی کار مشخص می‌شود.
- ${fa(yearsSince(1389))} سال است ${site.name} همین کار را در کسب‌وکار خودش انجام می‌دهد.
- برای شروع باید از صفحه‌ی /consult فرم درخواست مشاوره پر شود.
- بعد از ارسال فرم، ظرف ۴۸ ساعت کاری جواب داده می‌شود — حتی اگر جواب این باشد که کار در حوزه‌ی کاری او نیست.

راه‌های تماس:
- ایمیل: ${site.email}
${socialLines}

بخش‌های سایت:
- /articles — مقالات
- /topics — موضوع‌ها
- /resources — منابع قابل دانلود
- /about — درباره
- /consult — درخواست مشاوره
- /contact — تماس
`.trim()
}

const MAX_SNIPPET = 500

function trimBody(body: string): string {
  const stripped = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.length > MAX_SNIPPET ? `${stripped.slice(0, MAX_SNIPPET)}…` : stripped
}

async function relevantArticles(query: string) {
  if (query.trim().length < 2) return []

  try {
    return await db.$queryRaw<{ slug: string; title: string; excerpt: string; body: string }[]>`
      SELECT slug, title, excerpt, body
      FROM articles
      WHERE status = 'PUBLISHED'
        AND published_at <= NOW()
        AND (
          title ILIKE ${'%' + query + '%'}
          OR excerpt ILIKE ${'%' + query + '%'}
          OR body ILIKE ${'%' + query + '%'}
          OR similarity(title, ${query}) > 0.15
          OR similarity(excerpt, ${query}) > 0.15
        )
      ORDER BY
        GREATEST(similarity(title, ${query}), similarity(excerpt, ${query}) * 0.6) DESC,
        published_at DESC
      LIMIT 4
    `
  } catch (cause) {
    console.error('[chat:knowledge] article retrieval failed', cause)
    return []
  }
}

/** Built fresh per request: the static facts plus whatever articles the
 * visitor's own message matches. Keeping it per-request (not cached at module
 * scope) means a newly published article is answerable immediately — the same
 * reasoning that keeps lib/content/queries.ts filters function-scoped. */
export async function buildSiteContext(userMessage: string): Promise<string> {
  const articles = await relevantArticles(userMessage)

  const articleBlock = articles.length
    ? '\n\nمقاله‌های مرتبط منتشرشده در سایت:\n' +
      articles
        .map(
          (a, i) =>
            `[مقاله ${i + 1}] عنوان: ${a.title}\nنشانی: /articles/${a.slug}\nخلاصه: ${a.excerpt}\nمتن: ${trimBody(a.body)}`
        )
        .join('\n\n')
    : '\n\nهیچ مقاله‌ی منتشرشده‌ای با این سؤال هم‌خوانی نداشت.'

  return staticFacts() + articleBlock
}
