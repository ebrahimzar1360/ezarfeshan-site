import type { NextRequest } from 'next/server'
import { failRateLimit, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { db } from '@/lib/db'
import { htmlWrap, sendMail } from '@/lib/mailer'
import { clientIp, rateLimit, sweepRateLimits } from '@/lib/rate-limit'
import { site } from '@/lib/site'
import { leadSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Consultation request.
 *
 * The enquiry is stored first and mailed second. If the notification fails the
 * lead still exists in the admin list — losing a prospect because SMTP was down
 * is worse than a missed notification.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = leadSchema.safeParse(await request.json())
    if (!parsed.success) return failValidation(parsed.error)

    const { website, ...input } = parsed.data
    if (website) return ok({ received: true })

    const ip = clientIp(request.headers)
    const limited = await rateLimit(`lead:ip:${ip}`, { limit: 3, windowSeconds: 3600 })
    if (!limited.ok) return failRateLimit(limited.retryAfterSeconds)

    void sweepRateLimits()

    const lead = await db.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        company: input.company || null,
        teamSize: input.teamSize ?? null,
        challenge: input.challenge,
        budgetRange: input.budgetRange ?? null,
      },
    })

    const summary =
      `درخواست مشاورهٔ جدید\n\n` +
      `نام: ${lead.name}\n` +
      `ایمیل: ${lead.email}\n` +
      (lead.phone ? `تلفن: ${lead.phone}\n` : '') +
      (lead.company ? `کسب‌وکار: ${lead.company}\n` : '') +
      (lead.teamSize ? `اندازهٔ تیم: ${lead.teamSize}\n` : '') +
      (lead.budgetRange ? `بودجه: ${lead.budgetRange}\n` : '') +
      `\nمسئله:\n${lead.challenge}\n`

    // Notification failures must not fail the request — the lead is already saved.
    try {
      await sendMail({
        to: site.email,
        subject: `درخواست مشاوره — ${lead.name}`,
        text: summary,
        html: htmlWrap(summary),
      })

      const ack =
        `${lead.name} عزیز،\n\n` +
        `درخواستت رسید. توضیحی که نوشتی را می‌خوانم و خودم جواب می‌دهم — ` +
        `معمولاً ظرف چند روز کاری.\n\n` +
        `اگر در این فاصله سؤالی داشتی، همین ایمیل را جواب بده.\n\n${site.name}`

      await sendMail({
        to: lead.email,
        subject: 'درخواستت رسید',
        text: ack,
        html: htmlWrap(ack),
      })
    } catch (mailError) {
      console.error('[api:leads] lead saved but notification failed', mailError)
    }

    return ok({ received: true })
  } catch (cause) {
    return failUnexpected('leads', cause)
  }
}
