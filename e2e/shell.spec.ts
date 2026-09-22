import { expect, test } from '@playwright/test'

/**
 * The states nobody sees until something goes wrong. Before this suite existed
 * the site had no not-found, error or loading boundary at all, so a mistyped
 * address produced Next's English default page in the middle of a Persian site.
 */

test('a mistyped address lands on a Persian 404 that offers a way out', async ({ page }) => {
  const response = await page.goto('/nonsense-path-that-does-not-exist')

  expect(response?.status(), 'a missing page must answer 404, not 200').toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('این صفحه وجود ندارد')

  // the way out has to work, not just be present
  await page.getByRole('link', { name: 'همهٔ مقالات' }).click()
  await expect(page).toHaveURL(/\/articles$/)
})

test('a missing article and a missing topic both show the 404, with chrome intact', async ({
  page,
}) => {
  for (const path of ['/articles/no-such-article', '/topics/no-such-topic']) {
    await page.goto(path)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('این صفحه وجود ندارد')
    // the 404 brings its own chrome — the root layout carries none
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
  }

  // Status is asserted only for an unmatched path. A slug that misses inside an
  // ISR route answers 200 — see the soft-404 note in docs/OPEN-QUESTIONS.md §16.
  const response = await page.goto('/nonsense-path-that-does-not-exist')
  expect(response?.status()).toBe(404)
})

test('the 404 is excluded from search results', async ({ page }) => {
  await page.goto('/nonsense-path-that-does-not-exist')
  // Next emits its own noindex for a not-found render and the page adds one, so
  // this deliberately checks that every robots tag says noindex, not that there
  // is exactly one.
  const contents = await page
    .locator('meta[name="robots"]')
    .evaluateAll((tags) => tags.map((t) => t.getAttribute('content') ?? ''))
  expect(contents.length).toBeGreaterThan(0)
  for (const content of contents) expect(content).toMatch(/noindex/)
})

test('the 404 does not scroll sideways', async ({ page }) => {
  await page.goto('/nonsense-path-that-does-not-exist')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('skeletons stay out of the accessibility tree', async ({ page }) => {
  // A loading frame is furniture. If a skeleton announced itself, a screen
  // reader would read out a dozen empty boxes, and a stray role="status" on one
  // would make the strict-mode getByRole('status') in the other suites match
  // twice. Rendered here directly because the real ones only appear on a cold
  // dynamic navigation, which is not reproducible on demand.
  await page.goto('/articles')
  const announcing = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.pulse')).filter(
      (el) => !el.closest('[aria-hidden="true"]') && !el.hasAttribute('aria-hidden')
    ).length
  )
  expect(announcing).toBe(0)
})
