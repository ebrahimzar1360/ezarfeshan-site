import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { htmlWrap, sendMail } from '@/lib/mailer'
import { site } from '@/lib/site'
import { createToken, hashToken } from '@/lib/tokens'

export const runtime = 'nodejs'

/**
 * Confirmation link target.
 *
 * A GET, because it is opened from an email client — but it is the one place a
 * GET changes state, which is unavoidable for opt-in links. It is safe to
 * replay: the token is consumed on first use, so a mail scanner that pre-fetches
 * the link confirms the subscriber exactly once and a second visit lands on the
 * already-confirmed page rather than erroring.
 *
 * Redirects rather than returning JSON: the reader is a person in a browser.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const to = (status: string) =>
    NextResponse.redirect(new URL(`/newsletter/confirmed?status=${status}`, request.url))

  if (!token) return to('invalid')

  try {
    const subscriber = await db.subscriber.findUnique({
      where: { confirmTokenHash: hashToken(token) },
    })

    if (!subscriber) return to('invalid')
    if (subscriber.status === 'CONFIRMED') return to('already')

    // The unsubscribe token is minted here, not at signup: it has to outlive the
    // confirm token and appear in every future mailing.
    const unsub = createToken()

    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmTokenHash: null, // single use
        unsubscribeTokenHash: unsub.hash,
      },
    })

    const unsubUrl = `${site.url}/newsletter/unsubscribe?token=${unsub.token}`
    const text =
      `عضویتت تأیید شد.\n\n` +
      `هر دو هفته یک نوشته دربارهٔ سیستم‌سازی و مدیریت عملیات دریافت می‌کنی. ` +
      `نه تبلیغ، نه خلاصهٔ کتاب.\n\n` +
      `هر وقت خواستی لغو عضویت کن:\n${unsubUrl}\n\n${site.name}`

    await sendMail({
      to: subscriber.email,
      subject: 'عضویتت تأیید شد',
      text,
      html: htmlWrap(text),
    })

    return to('confirmed')
  } catch (cause) {
    console.error('[api:newsletter/confirm]', cause)
    return to('error')
  }
}
