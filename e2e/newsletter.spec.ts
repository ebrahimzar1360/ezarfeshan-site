import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

/**
 * Newsletter signup, end to end, through the browser.
 *
 * The confirmation token never appears in a response — it is hashed before
 * storage — so the link is recovered where a real subscriber gets it: the
 * message the mailer produced. With MAIL_DRIVER=console that is the server log.
 */

const LOG = process.env.E2E_SERVER_LOG ?? 'server.log'

/**
 * Next.js renders its route announcer as a permanent, empty
 * <div role="alert" id="__next-route-announcer__">, so getByRole('alert')
 * matches two elements on every page. This selects only our own messages.
 */
const ALERT = '[role="alert"]:not(#__next-route-announcer__)'


function lastConfirmLink(): string | null {
  const log = readFileSync(LOG, 'utf8')
  const matches = [...log.matchAll(/newsletter\/confirm\?token=([A-Za-z0-9_-]+)/g)]
  return matches.length ? (matches[matches.length - 1]?.[1] ?? null) : null
}

test.describe('newsletter', () => {
  test('a visitor can subscribe and confirm', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`

    await page.goto('/newsletter')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('هر دو هفته')

    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: 'عضویت' }).click()

    // The wording matters: with double opt-in the person is NOT subscribed yet,
    // and saying they are would be a small lie that costs deliverability.
    const confirmation = page.getByRole('status')
    await expect(confirmation).toContainText('ایمیل تأیید فرستاده شد')
    await expect(confirmation).toContainText('تا وقتی تأیید نکنی')

    const token = lastConfirmLink()
    expect(token, 'a confirmation link should have been mailed').toBeTruthy()

    await page.goto(`/api/newsletter/confirm?token=${token}`)
    await expect(page).toHaveURL(/status=confirmed/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('تأیید شد')
  })

  test('a bad address is rejected in Persian before anything is sent', async ({ page }) => {
    await page.goto('/newsletter')
    await page.getByPlaceholder('you@example.com').fill('not-an-address')
    await page.getByRole('button', { name: 'عضویت' }).click()

    const error = page.locator(ALERT)
    await expect(error).toBeVisible()
    await expect(error).toContainText('معتبر')
  })

  test('a broken confirmation link explains itself and offers a way forward', async ({ page }) => {
    await page.goto('/newsletter/confirm?token=definitely-not-a-real-token'.replace('/newsletter', '/api/newsletter'))
    await expect(page).toHaveURL(/status=invalid/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('کار نمی‌کند')
    await expect(page.getByRole('link', { name: /ثبت‌نام دوباره/ })).toBeVisible()
  })
})
