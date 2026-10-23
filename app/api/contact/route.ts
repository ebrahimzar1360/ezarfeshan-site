import type { NextRequest } from 'next/server'
import { failRateLimit, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { db } from '@/lib/db'
import { htmlWrap, sendMail } from '@/lib/mailer'
import { clientIp, rateLimit, sweepRateLimits } from '@/lib/rate-limit'
import { site } from '@/lib/site'
import { contactSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The /contact form. Messages are stored as leads so they appear in the same
 * admin list as consultation requests — a second table would split one inbox in
 * two. The Lead model wants an email, which this form does not require, so:
 *   - an email-shaped contact goes in `email`
 *   - anything else (a phone or WhatsApp number) goes in `phone`, and `email`
 *     is left empty
 *   - the subject and the contact as typed are repeated at the top of
 *     `challenge`, so the admin shows the whole message in one place.
 * Same order as /api/leads: rate limit → honeypot → validate → store → notify.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = contactSchema.safeParse(await request.json())
    if (!parsed.success) return failValidation(parsed.error)

    const { website, ...input } = parsed.data
    if (website) return ok({ received: true })

    const ip = clientIp(request.headers)
    const limited = await rateLimit(`contact:ip:${ip}`, { limit: 3, windowSeconds: 3600 })
    if (!limited.ok) return failRateLimit(limited.retryAfterSeconds)

    void sweepRateLimits()

    const isEmail = EMAIL.test(input.contact)
    const lead = await db.lead.create({
      data: {
        name: input.name,
        email: isEmail ? input.contact : '',
        phone: isEmail ? null : input.contact.slice(0, 20),
        challenge: `موضوع: ${input.subject}\nراه ارتباطی: ${input.contact}\n\n${input.message}`,
        source: 'contact',
      },
    })

    const summary =
      `پیام جدید از صفحهٔ تماس\n\n` +
      `نام: ${lead.name}\n` +
      `راه ارتباطی: ${input.contact}\n` +
      `موضوع: ${input.subject}\n\n` +
      `${input.message}\n`

    // The message is already stored; a mail failure must not fail the request.
    try {
      await sendMail({
        to: site.email,
        subject: `پیام تماس — ${lead.name}`,
        text: summary,
        html: htmlWrap(summary),
      })

      if (isEmail) {
        const ack =
          `${lead.name} عزیز،\n\n` +
          `پیامت رسید. می‌خوانم و خودم جواب می‌دهم.\n\n${site.name}`
        await sendMail({
          to: input.contact,
          subject: 'پیامت رسید',
          text: ack,
          html: htmlWrap(ack),
        })
      }
    } catch (mailError) {
      console.error('[api:contact] message saved but notification failed', mailError)
    }

    return ok({ received: true })
  } catch (cause) {
    return failUnexpected('contact', cause)
  }
}
