import type { NextRequest } from 'next/server'
import { failRateLimit, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { db } from '@/lib/db'
import { htmlWrap, sendMail } from '@/lib/mailer'
import { clientIp, rateLimit, sweepRateLimits } from '@/lib/rate-limit'
import { site } from '@/lib/site'
import { createToken } from '@/lib/tokens'
import { subscribeSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Newsletter signup, double opt-in.
 *
 * The response is identical whether the address is new, already pending, or
 * already confirmed. Different replies would turn this endpoint into a
 * membership oracle — anyone could test whether a given person is subscribed.
 * The mail that arrives (or does not) tells the real owner what happened.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = subscribeSchema.safeParse(await request.json())
    if (!parsed.success) return failValidation(parsed.error)

    const { email, name, source, website } = parsed.data

    // honeypot: silently accept so the bot has nothing to learn from the reply
    if (website) return ok({ pending: true })

    const ip = clientIp(request.headers)
    const byIp = await rateLimit(`subscribe:ip:${ip}`, { limit: 5, windowSeconds: 3600 })
    if (!byIp.ok) return failRateLimit(byIp.retryAfterSeconds)

    const byEmail = await rateLimit(`subscribe:email:${email}`, {
      limit: 3,
      windowSeconds: 3600,
    })
    if (!byEmail.ok) return failRateLimit(byEmail.retryAfterSeconds)

    void sweepRateLimits()

    const existing = await db.subscriber.findUnique({ where: { email } })

    // Already confirmed: nothing to do, and re-sending a confirmation link to a
    // settled address is how people get annoyed.
    if (existing?.status === 'CONFIRMED') return ok({ pending: true })

    const { token, hash } = createToken()

    await db.subscriber.upsert({
      where: { email },
      update: {
        // an unsubscribed address that signs up again starts a fresh opt-in
        status: 'PENDING',
        confirmTokenHash: hash,
        unsubscribedAt: null,
        ...(name ? { name } : {}),
        ...(source ? { source } : {}),
      },
      create: {
        email,
        status: 'PENDING',
        confirmTokenHash: hash,
        ...(name ? { name } : {}),
        ...(source ? { source } : {}),
      },
    })

    const confirmUrl = `${site.url}/api/newsletter/confirm?token=${token}`
    const text =
      `${name ? `${name} عزیز،\n\n` : ''}` +
      `برای تکمیل عضویت در خبرنامه، روی این نشانی کلیک کن:\n\n${confirmUrl}\n\n` +
      `اگر خودت درخواست عضویت نداده‌ای، این ایمیل را نادیده بگیر — بدون تأیید تو ` +
      `هیچ ایمیلی فرستاده نمی‌شود.\n\n${site.name}`

    await sendMail({
      to: email,
      subject: 'تأیید عضویت در خبرنامه',
      text,
      html: htmlWrap(text),
    })

    return ok({ pending: true })
  } catch (cause) {
    return failUnexpected('newsletter/subscribe', cause)
  }
}
