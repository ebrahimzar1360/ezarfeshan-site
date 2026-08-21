import { site } from './site'

/**
 * Mail transport.
 *
 * Two drivers, chosen by MAIL_DRIVER:
 *   console — writes the message to the terminal. The default in development,
 *             so the whole double opt-in loop can be exercised end to end
 *             without an SMTP account.
 *   smtp    — real delivery via nodemailer.
 *
 * The domain is not registered yet, so `smtp` has nowhere credible to send
 * from: gmail.com cannot carry SPF/DKIM for this brand and confirmation mail
 * would land in spam. See docs/OPEN-QUESTIONS.md. Until then `console` is the
 * only driver that should be used.
 */

export type Mail = {
  to: string
  subject: string
  /** Plain text is the source of truth; the HTML part is generated from it. */
  text: string
  html?: string
}

type Driver = (mail: Mail) => Promise<void>

const from = process.env.MAIL_FROM ?? `${site.name} <no-reply@localhost>`

const consoleDriver: Driver = async (mail) => {
  const line = '─'.repeat(64)
  console.log(
    `\n${line}\n[mail:console] from: ${from}\n` +
      `to:      ${mail.to}\n` +
      `subject: ${mail.subject}\n${line}\n${mail.text}\n${line}\n`
  )
}

const smtpDriver: Driver = async (mail) => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'MAIL_DRIVER=smtp but SMTP_HOST / SMTP_USER / SMTP_PASS are not all set'
    )
  }

  // imported lazily so the dependency never loads under the console driver
  const nodemailer = await import('nodemailer')
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transport.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    ...(mail.html ? { html: mail.html } : {}),
  })
}

const drivers: Record<string, Driver> = {
  console: consoleDriver,
  smtp: smtpDriver,
}

export async function sendMail(mail: Mail): Promise<void> {
  const name = process.env.MAIL_DRIVER ?? 'console'
  const driver = drivers[name]
  if (!driver) throw new Error(`unknown MAIL_DRIVER: ${name}`)
  await driver(mail)
}

/**
 * Minimal RTL HTML wrapper. Deliberately table-free and inline-styled: mail
 * clients strip stylesheets, and anything more elaborate degrades worse than
 * plain text does.
 */
export function htmlWrap(bodyText: string): string {
  const paragraphs = bodyText
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

  return (
    `<!doctype html><html dir="rtl" lang="fa"><meta charset="utf-8">` +
    `<body style="margin:0;padding:24px;background:#f5f5f0;color:#1a1a1a;` +
    `font:16px/1.9 Tahoma,Arial,sans-serif">` +
    `<div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;` +
    `border:1px solid rgba(26,26,26,.12);border-radius:6px">` +
    `<div style="border-inline-start:4px solid #c8a84b;padding-inline-start:14px;margin-bottom:22px">` +
    `<strong style="font-size:18px">${escapeHtml(site.name)}</strong></div>` +
    paragraphs +
    `</div></body></html>`
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
