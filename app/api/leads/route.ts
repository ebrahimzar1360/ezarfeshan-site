import type { NextRequest } from 'next/server'
import { fail, failRateLimit, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { db } from '@/lib/db'
import { htmlWrap, sendMail } from '@/lib/mailer'
import { clientIp, rateLimit, sweepRateLimits } from '@/lib/rate-limit'
import { findService } from '@/lib/content/services'
import { site } from '@/lib/site'
import { leadSchema, serviceRequestSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Consultation request, and — when the body names a `service` — a request from
 * /services. Both land in the same `leads` table and the same /admin/leads
 * inbox, told apart by `source`.
 *
 * The enquiry is stored first and mailed second. If the notification fails the
 * lead still exists in the admin list — losing a prospect because SMTP was down
 * is worse than a missed notification.
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    if (body && typeof body === 'object' && 'service' in body) return serviceRequest(request, body)

    const parsed = leadSchema.safeParse(body)
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
        source: 'consult',
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

/**
 * A request from a service card on /services. Same order as above: validate,
 * drop a filled honeypot quietly, rate limit, store, then notify. The slug must
 * be one of the services the CMS lists; the stored `service` is its title, as
 * the visitor saw it.
 *
 * Only the owner is notified, and only through the configured mail driver — the
 * visitor is promised a call, not an email, so no acknowledgement is sent.
 */
async function serviceRequest(request: NextRequest, body: object) {
  const parsed = serviceRequestSchema.safeParse(body)
  if (!parsed.success) return failValidation(parsed.error)

  const { website, ...input } = parsed.data
  if (website) return ok({ received: true })

  const ip = clientIp(request.headers)
  const limited = await rateLimit(`service:ip:${ip}`, { limit: 5, windowSeconds: 3600 })
  if (!limited.ok) return failRateLimit(limited.retryAfterSeconds)

  void sweepRateLimits()

  const service = await findService(input.service)
  if (!service) return fail('این خدمت دیگر در فهرست نیست. صفحه را تازه کنید و دوباره انتخاب کنید.', 422, { service: 'خدمت انتخاب‌شده معتبر نیست.' })

  const lead = await db.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.business || null,
      challenge: input.need,
      service: service.title,
      source: 'services',
    },
  })

  const summary =
    `درخواست خدمت جدید\n\n` +
    `خدمت: ${service.title}\n` +
    `نام: ${lead.name}\n` +
    `شماره تماس: ${lead.phone}\n` +
    `ایمیل: ${lead.email}\n` +
    (lead.company ? `کسب‌وکار: ${lead.company}\n` : '') +
    `\nمشکل یا نیاز:\n${lead.challenge}\n`

  try {
    await sendMail({
      to: site.email,
      subject: `درخواست ${service.title} — ${lead.name}`,
      text: summary,
      html: htmlWrap(summary),
    })
  } catch (mailError) {
    console.error('[api:leads] service request saved but notification failed', mailError)
  }

  return ok({ received: true })
}
