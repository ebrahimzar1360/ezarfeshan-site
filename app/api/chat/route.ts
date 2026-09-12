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
 * $0 forever, by design. A handful of OpenRouter's ":free" models are gated
 * to "agentic harnesses" (coding-agent clients) and 403 on a plain chat
 * request — confirmed by hand against thinkingmachines/inkling:free and
 * every other Thinking Machines model. These three were confirmed by hand to
 * answer plain chat completions, hold up a Persian system prompt, and use
 * injected context correctly instead of paraphrasing around it.
 * poolside/laguna and dots-studio/dots-3-note-preview were excluded even
 * though they passed: dots-3-note-preview carries an announced removal date,
 * and picking a model set that might vanish defeats "just make it free."
 *
 * Free tiers get rate-limited hard under shared load (google/gemma-4-31b-it
 * returned 429 on nearly every call in testing), so this is a small chain,
 * not a single model — a 429 or 5xx moves to the next entry instead of
 * failing the request.
 */
const FREE_MODEL_CHAIN = [
  process.env.OPENROUTER_MODEL,
  'nex-agi/nex-n2.5-pro:free',
  'nex-agi/nex-n2.5-mini:free',
  'inclusionai/ling-3.0-flash-fin:free',
].filter((m): m is string => Boolean(m))

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
۸. متن ساده بنویس — بدون قالب‌بندی مارکداون (بدون **، بدون #، بدون لیست با -)، چون این پیام در یک حباب گفت‌وگوی ساده نمایش داده می‌شود.

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

    let reply: string | undefined
    let lastError: string | undefined

    // Free-tier endpoints get rate-limited (429) or occasionally 5xx under
    // shared load — one bad model must not fail the whole request while the
    // next one in the chain would have answered fine.
    for (const model of FREE_MODEL_CHAIN) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

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
            model,
            messages,
            temperature: 0.3,
            max_tokens: 600,
            // Several free models on the chain are reasoning models that, left
            // to default, put their chain-of-thought straight into `content`
            // instead of the final answer — confirmed by hand against
            // nvidia/nemotron-3-super. This keeps every model in the chain
            // returning just the answer.
            reasoning: { enabled: false },
          }),
        })

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => '')
          lastError = `${model} ${upstream.status}`
          console.error('[api:chat] upstream error', model, upstream.status, detail.slice(0, 500))
          // 429 (rate-limited) and 5xx are the transient, worth-a-retry cases.
          // Anything else (400 bad request, 401/403 auth/gating) will fail
          // identically on the next model too if it's a request-shape issue,
          // but a gated or misconfigured single model shouldn't be fatal
          // either — keep falling through the chain regardless of status.
          continue
        }

        const completion: { choices?: { message?: { content?: string } }[] } =
          await upstream.json()
        const content = completion.choices?.[0]?.message?.content?.trim()
        if (content) {
          reply = content
          break
        }
        lastError = `${model} empty completion`
      } catch (cause) {
        lastError =
          cause instanceof Error && cause.name === 'AbortError'
            ? `${model} timeout`
            : `${model} ${String(cause)}`
      } finally {
        clearTimeout(timeout)
      }
    }

    if (!reply) {
      return failUnexpected('chat', new Error(lastError ?? 'all free models exhausted'))
    }

    return ok({ reply })
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      return failUnexpected('chat', new Error('upstream timeout'))
    }
    return failUnexpected('chat', cause)
  }
}
