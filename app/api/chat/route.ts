import type { NextRequest } from 'next/server'
import { buildSiteContext } from '@/lib/chat/knowledge'
import { failRateLimit, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { clientIp, rateLimit, sweepRateLimits } from '@/lib/rate-limit'
import { site } from '@/lib/site'
import { chatSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Site-scoped chat assistant.
 *
 * Answers only from lib/chat/knowledge.ts — the bio, the consult pricing, the
 * contact details, and whichever published articles match the question. The
 * model is instructed to refuse anything the context does not cover rather
 * than fall back on what it already knows, because "a helpful-sounding wrong
 * answer about this site" is worse than "I don't have that on the site."
 *
 * No conversation is stored — there is no schema for it, and a stateless
 * request/response is enough for a visitor asking a handful of questions.
 * The client keeps the transcript in memory and resends a short tail of it
 * as `history` so the model can track the immediate thread.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
/**
 * DeepSeek V4 Flash: $0.04 / $0.08 per million tokens — a full conversation
 * turn costs a small fraction of a cent. Every free-tier model on OpenRouter
 * that could actually hold a conversation turned out to be gated to "agentic
 * harnesses" (coding-agent clients) and returns 403 on a plain chat request —
 * confirmed by hand against thinkingmachines/inkling:free before landing on
 * this one. Requires a positive OpenRouter credit balance to work at all.
 */
const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash-0731'
const REQUEST_TIMEOUT_MS = 20_000

function systemPrompt(context: string): string {
  return `تو دستیار گفت‌وگوی سایت شخصی «${site.name}» هستی.

قانون‌های سخت‌گیرانه‌ای که هرگز نباید بشکنی:
۱. فقط و فقط از اطلاعات بخش «زمینه» زیر جواب بده. این اطلاعات مستقیماً از همین سایت گرفته شده‌اند.
۲. هیچ دانش عمومی یا اطلاعات بیرون از زمینه را وارد جواب نکن — نه دربارهٔ ابراهیم زرفشان، نه دربارهٔ موضوع‌های دیگر.
۳. هیچ عدد، قیمت، وعده یا ادعایی که در زمینه نیامده نساز. اگر رقمی نیست، نگو.
۴. اگر جواب سؤال در زمینه نیست، صریح بگو این اطلاعات روی سایت موجود نیست، و کاربر را به یکی از این‌ها ارجاع بده: صفحهٔ /consult برای درخواست مشاوره، صفحهٔ /contact برای تماس مستقیم، یا /articles برای مرور مقاله‌ها.
۵. اگر سؤال کاملاً بی‌ربط به این سایت بود (مثل کدنویسی، هوای امروز، مسائل شخصی کاربر که ربطی به کسب‌وکار ندارد)، مؤدبانه بگو کارت محدود به راهنمایی دربارهٔ این سایت است و موضوع را به کارهای ${site.name} برگردان.
۶. همیشه فارسی و محاوره‌ای-حرفه‌ای بنویس، کوتاه و مستقیم — نه رسمی و خشک، نه پرحرف.
۷. هرگز وانمود نکن جای فرم مشاوره یا تماس مستقیم با ${site.name} را می‌گیری؛ برای قرار گذاشتن واقعی، همیشه به فرم /consult ارجاع بده.

زمینه (تنها منبع مجاز برای جواب دادن):
${context}`
}

export async function POST(request: NextRequest) {
  try {
    const parsed = chatSchema.safeParse(await request.json())
    if (!parsed.success) return failValidation(parsed.error)

    const { message, history } = parsed.data

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error('[api:chat] OPENROUTER_API_KEY is not set')
      return failUnexpected('chat', new Error('missing OPENROUTER_API_KEY'))
    }

    const ip = clientIp(request.headers)
    const limited = await rateLimit(`chat:ip:${ip}`, { limit: 20, windowSeconds: 600 })
    if (!limited.ok) return failRateLimit(limited.retryAfterSeconds)

    void sweepRateLimits()

    const context = await buildSiteContext(message)

    const messages = [
      { role: 'system', content: systemPrompt(context) },
      ...(history ?? []).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let completion: { choices?: { message?: { content?: string } }[] }
    try {
      const upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          // OpenRouter uses these to attribute traffic on its public leaderboard.
          // X-Title must be a valid HTTP header value (ISO-8859-1 bytes only),
          // so the Latin form of the name goes here — fetch throws a ByteString
          // conversion error on the Persian one.
          'HTTP-Referer': site.url,
          'X-Title': site.nameLatin,
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
          messages,
          temperature: 0.3,
          max_tokens: 600,
        }),
      })

      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => '')
        console.error('[api:chat] upstream error', upstream.status, detail.slice(0, 500))
        return failUnexpected('chat', new Error(`openrouter ${upstream.status}`))
      }

      completion = await upstream.json()
    } finally {
      clearTimeout(timeout)
    }

    const reply = completion.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return failUnexpected('chat', new Error('empty completion'))
    }

    return ok({ reply })
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      return failUnexpected('chat', new Error('upstream timeout'))
    }
    return failUnexpected('chat', cause)
  }
}
