import { z } from 'zod'

/**
 * Shared schemas. The same object validates on the client (react-hook-form) and
 * again on the server — the client copy is for the error message, the server
 * copy is the one that actually protects anything.
 *
 * Messages are Persian and say what to do, not just what is wrong.
 */

const email = z
  .string()
  .trim()
  .min(1, 'نشانی ایمیل را وارد کن.')
  .max(254, 'این نشانی بیش از حد طولانی است.')
  .email('نشانی ایمیل معتبر نیست. مثال: name@example.com')
  // stored lowercase so "A@x.com" and "a@x.com" cannot become two subscribers
  .transform((v) => v.toLowerCase())

/**
 * Honeypot. A real person never sees this field, so any value means a bot.
 * Used instead of a captcha: no third-party script, no accessibility cost,
 * nothing for the reader to solve.
 *
 * Deliberately permissive. Rejecting a filled honeypot here would return a 422
 * naming the field, which tells the bot exactly which input to leave alone next
 * time. Validation passes and the route quietly returns success instead, so a
 * scripted submission is indistinguishable from a real one.
 */
const honeypot = z.string().max(200).optional()

export const subscribeSchema = z.object({
  email,
  name: z.string().trim().max(80, 'نام بیش از حد طولانی است.').optional(),
  source: z.string().trim().max(120).optional(),
  website: honeypot,
})

export const unsubscribeSchema = z.object({
  token: z.string().min(10, 'لینک لغو عضویت معتبر نیست.'),
})

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نامت را وارد کن.')
    .max(80, 'نام بیش از حد طولانی است.'),
  email,
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\d+\-() ]*$/, 'شمارهٔ تماس فقط می‌تواند رقم و + - ( ) داشته باشد.')
    .optional()
    .or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  teamSize: z.enum(['1', '2-5', '6-20', '21-50', '50+']).optional(),
  challenge: z
    .string()
    .trim()
    .min(30, 'کمی بیشتر توضیح بده — دست‌کم ۳۰ کاراکتر. مشخص‌تر بنویسی، جواب دقیق‌تری می‌گیری.')
    .max(2000, 'توضیح بیش از حد طولانی است. خلاصه‌ترش کن.'),
  budgetRange: z.enum(['نمی‌دانم', 'تا ۵۰ میلیون', '۵۰ تا ۱۵۰ میلیون', 'بیش از ۱۵۰ میلیون']).optional(),
  website: honeypot,
})

export const downloadSchema = z.object({
  email,
  website: honeypot,
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
export type LeadInput = z.infer<typeof leadSchema>
export type DownloadInput = z.infer<typeof downloadSchema>
