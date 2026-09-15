import type { NextRequest } from 'next/server'
import { buildSiteContext } from '@/lib/chat/knowledge'
import { toPlainText } from '@/lib/chat/plain-text'
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
  'inclusionai/ling-3.0-flash-fin:free',
  'nex-agi/nex-n2.5-pro:free',
].filter((m): m is string => Boolean(m))

/**
 * Order is the whole performance story, and it was wrong.
 *
 * The chain used to lead with nex-n2.5-pro and carry nex-n2.5-mini second.
 * Measured against a real prompt — the full site context, not a one-line test —
 * pro takes 20-58s and mini returns a 504 after five minutes. Both therefore
 * blew the per-model timeout on every single request, and ling answered every
 * question on the site after ~40s of waiting for two models that were never
 * going to reply. The visitor paid 40 seconds for a 2-second answer.
 *
 * A short test prompt hides this completely: pro answers "say hello" in 7.9s.
 * The context is what pushes it over. Measure with the real payload.
 *
 * ling-3.0-flash-fin now leads at 1.5-2.0s, and it is also the model whose
 * answers tools/audit/chat.mjs already validates — it is what has been
 * answering all along. pro stays as the fallback because it does work, just
 * slowly. mini is gone: a model that 504s is not a fallback, it is a delay.
 */

/**
 * Per-model ceiling. Above the fallback's slow-but-real 20s so a working model
 * is not cut off, below the point where the chain cannot finish inside
 * maxDuration.
 */
const REQUEST_TIMEOUT_MS = 25_000

/**
 * Whole-request ceiling. Vercel kills the function at maxDuration and the
 * visitor gets a blank reply with no error — seen in production at 61s, where
 * the old chain's two dead models ate the entire budget. No new model is
 * started past this, so the last one always has room to answer or fail
 * honestly.
 */
const TOTAL_DEADLINE_MS = 45_000

/** Vercel's default (10s on Hobby) is below a single slow model, so the
 * fallback could never run there. */
export const maxDuration = 60

function systemPrompt(context: string): string {
  return `تو دستیار گفت‌وگوی سایت شخصی «${site.name}» هستی.

قانون‌های سخت‌گیرانه‌ای که هرگز نباید بشکنی:
۱. فقط و فقط از اطلاعات بخش «زمینه» زیر جواب بده. این اطلاعات مستقیماً از همین سایت گرفته شده‌اند.
۲. هیچ دانش عمومی یا اطلاعات بیرون از زمینه را وارد جواب نکن — نه دربارهٔ ابراهیم زرفشان، نه دربارهٔ موضوع‌های دیگر.
۲-الف. این محدودیت شامل خودِ همین گفت‌وگو نمی‌شود. هرچه کاربر در پیام‌های قبلی همین گفت‌وگو گفته (اسمش، کسب‌وکارش، مسئله‌اش) را به یاد بیاور و در جواب استفاده کن. اگر پرسید «اسم من چه بود؟» پیش از جواب دادن، کل پیام‌های کاربر را از اولین پیام تا آخرین پیام دوباره بخوان و دنبالش بگرد — معمولاً در همان اولین پیام گفته شده. «در زمینهٔ سایت نیامده» یا «اسمت را نگفتی» جوابِ غلطی است برای چیزی که خودِ کاربر بالاتر گفته است. فقط وقتی بگو نگفته‌ای که واقعاً در هیچ‌کدام از پیام‌ها نباشد.
۲-ب. اگر در تاریخچه پیامی با متن «(چند پیام میانی این گفت‌وگو برای کوتاه شدن حذف شده است.)» دیدی، یعنی بخشی از میانهٔ گفت‌وگو برای کوتاه شدن حذف شده. پیام‌های پیش و پس از آن هر دو واقعی‌اند و مال همین گفت‌وگو؛ به این نشانه اشاره نکن و آن را جزو حرف‌های کاربر حساب نکن.
۳. هیچ عدد، قیمت، تاریخ، وعده یا ادعایی که در زمینه نیامده نساز.
۳-الف. برای هر رقم — قیمت، سال، مدت سابقه — فقط همان چیزی را بگو که عیناً در زمینه آمده. اگر زمینه مدت گفته («۱۶ سال») سال شروع را حساب نکن، و اگر سال شروع گفته («از ۱۳۸۹») مدت را از خودت نساز مگر در زمینه آمده باشد. اگر رقمی اصلاً در زمینه نیست، بگو روی سایت مشخص نشده — هرگز رقم تقریبی حدس نزن و هرگز بازه یا میانگین از خودت نساز.
۳-ب. هر بار رقمی گفتی، در همان جمله بگو کجای سایت نوشته شده — مثلاً «در صفحهٔ /consult نوشته شده که…» یا «در صفحهٔ /about آمده…». یک عدد بدون نشانی، حتی وقتی درست است، برای کاربر از خودساخته قابل تشخیص نیست و اعتمادش را می‌برد. اگر نمی‌توانی بگویی عدد از کدام بخش زمینه آمده، اصلاً نگوش.
۴. اگر جواب سؤال در زمینه نیست، صریح بگو این اطلاعات روی سایت موجود نیست، و کاربر را به یکی از این‌ها ارجاع بده: صفحهٔ /consult برای درخواست مشاوره، صفحهٔ /contact برای تماس مستقیم، یا /articles برای مرور مقاله‌ها.
۵. اگر سؤال کاملاً بی‌ربط به این سایت بود (مثل کدنویسی، هوای امروز، مسائل شخصی کاربر که ربطی به کسب‌وکار ندارد)، مؤدبانه بگو کارت محدود به راهنمایی دربارهٔ این سایت است و موضوع را به کارهای ${site.name} برگردان.
۶. همیشه فارسی و محاوره‌ای-حرفه‌ای بنویس، کوتاه و مستقیم — نه رسمی و خشک، نه پرحرف.
۷. هرگز وانمود نکن جای فرم مشاوره یا تماس مستقیم با ${site.name} را می‌گیری.
۷-الف. اگر کاربر خواست درخواست مشاوره ثبت کند یا اطلاعات تماسش را داد، بگو همین‌جا دکمهٔ «ثبت درخواست مشاوره» پایین گفت‌وگو هست که فرم کوتاهش را پر کند، یا صفحهٔ /consult. خودت اطلاعات تماس را در متن جمع نکن و نگو «ثبت کردم» — ثبت فقط با آن فرم انجام می‌شود.
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
    const startedAt = Date.now()

    for (const model of FREE_MODEL_CHAIN) {
      const left = TOTAL_DEADLINE_MS - (Date.now() - startedAt)
      // Starting a model with two seconds left only guarantees a timeout —
      // better to return the error we already have than to burn the budget
      // and have Vercel kill the function mid-answer.
      if (left < 5_000) {
        lastError ??= 'deadline reached before any model answered'
        break
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), Math.min(REQUEST_TIMEOUT_MS, left))

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
        // Rule ۸ asks for plain text; this enforces it. A model that obeys
        // most of the time fails in front of a visitor and never in testing.
        const content = toPlainText(completion.choices?.[0]?.message?.content ?? '')
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
