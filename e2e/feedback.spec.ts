import { expect, test } from '@playwright/test'

/**
 * Feedback surfaces: the toast viewport, button loading states, and the chat
 * widget after it was split into components/site/chat/.
 */

test('the toast viewport never registers as a status region', async ({ page }) => {
  // This is the guard for the single most likely way this overhaul breaks the
  // suite. e2e/admin.spec.ts and e2e/newsletter.spec.ts both call
  // getByRole('status') unqualified; a persistent viewport carrying that role
  // would match on every page and fail Playwright's strict mode everywhere.
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveCount(0)

  // ...while still being a live region, which is what makes it announce.
  const live = page.locator('[aria-live="polite"]')
  expect(await live.count()).toBeGreaterThan(0)
})

test('a submit button keeps its accessible name while it is working', async ({ page }) => {
  // The request is held open on purpose. Asserting after it completes was racy:
  // a successful signup swaps the whole form for the success block, so the
  // button is gone and the assertion failed about one run in three. The
  // behaviour under test only exists *during* the request, so the test has to
  // own that window rather than hope to catch it.
  let release: () => void = () => {}
  const inFlight = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.route('**/api/newsletter/subscribe', async (route) => {
    await inFlight
    await route.continue()
  })

  await page.goto('/newsletter')
  await page.getByPlaceholder('you@example.com').fill(`e2e-${Date.now()}@example.com`)
  await page.getByRole('button', { name: 'عضویت' }).click()

  // Mid-request: the label used to become "در حال ارسال…", renaming the control
  // while a click could still be landing on it.
  const submit = page.getByRole('button', { name: 'عضویت' })
  await expect(submit).toHaveCount(1)
  await expect(submit).toHaveAttribute('aria-busy', 'true')

  release()
})

test.describe('chat widget', () => {
  test('opens, closes on Escape, and hands focus back to the launcher', async ({ page }) => {
    await page.goto('/')

    const launcher = page.getByRole('button', { name: /باز کردن گفت‌وگو/ })
    await launcher.click()

    const panel = page.getByRole('dialog', { name: /گفت‌وگو با دستیار/ })
    await expect(panel).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(page.getByRole('button', { name: /باز کردن گفت‌وگو/ })).toBeFocused()
  })

  test('the page behind it stays readable — it is not a modal', async ({ page }) => {
    // The rest of the site uses <dialog>+showModal(), which inerts the page.
    // This panel deliberately does not: you can keep reading while it is open.
    await page.goto('/')
    await page.getByRole('button', { name: /باز کردن گفت‌وگو/ }).click()
    await expect(page.getByRole('dialog', { name: /گفت‌وگو با دستیار/ })).toBeVisible()

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const inert = await h1.evaluate((el) => !!el.closest('[inert]'))
    expect(inert).toBe(false)
  })

  test('the launcher only appears once it can actually be clicked', async ({ page }) => {
    // Guards commit 519ed19: the launcher was server-rendered, so it looked
    // clickable before hydration and the first click vanished. The fix is to
    // render nothing until hydrated — easy to lose while tidying, and silent
    // when it breaks.
    await page.goto('/')
    const launcher = page.getByRole('button', { name: /باز کردن گفت‌وگو/ })
    await launcher.click()
    await expect(page.getByRole('dialog', { name: /گفت‌وگو با دستیار/ })).toBeVisible()
  })

  test('the lead form uses the same controls as the rest of the site', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /باز کردن گفت‌وگو/ }).click()
    await page.getByRole('button', { name: 'ثبت درخواست مشاوره' }).click()

    // Scoped to the panel: the homepage newsletter field is labelled
    // "نشانی ایمیل", which getByLabel matches as a substring of "ایمیل".
    const panel = page.getByRole('dialog', { name: /گفت‌وگو با دستیار/ })
    await expect(panel.getByLabel('نام')).toBeVisible()
    await expect(panel.getByRole('button', { name: 'ثبت درخواست' })).toBeVisible()

    // Too-short challenge is rejected before anything is sent.
    await panel.getByLabel('نام').fill('تست')
    await panel.getByLabel('ایمیل', { exact: true }).fill('t@example.com')
    await panel.getByLabel('مسئله‌ات چیست؟').fill('کوتاه')
    await panel.getByRole('button', { name: 'ثبت درخواست' }).click()
    await expect(panel.locator('[role="alert"]')).toContainText('۳۰')
  })
})
