import { expect, test } from '@playwright/test'

test('the first h3 on the article list is an article link', async ({ page }) => {
  // e2e/site.spec.ts clicks the first level-3 heading on /articles and expects
  // to land on an article; anything added above the grid must not add an h3.
  await page.goto('/articles')
  const first = page.getByRole('heading', { level: 3 }).first()
  const href = await first.locator('xpath=ancestor-or-self::a[1]').getAttribute('href')
  expect(href).toMatch(/^\/articles\//)
})

test('the six categories always show, and "همه" is current on /articles', async ({ page }) => {
  await page.goto('/articles')
  const chips = page.getByRole('navigation', { name: 'موضوع‌ها' })
  for (const name of ['مدیریت', 'سیستم‌سازی', 'هوش مصنوعی', 'کسب‌وکار', 'رهبری و تیم', 'توسعه فردی']) {
    await expect(chips.getByRole('link', { name, exact: true })).toHaveCount(1)
  }
  await expect(chips.locator('[aria-current="page"]')).toHaveCount(1)
})

test('every note ends with the references statement', async ({ page }) => {
  await page.goto('/articles')
  await expect(page.getByRole('heading', { name: 'منابع و ایده‌های مرجع' })).toBeVisible()
})

test('the homepage follows the briefed order', async ({ page }) => {
  await page.goto('/')
  const headings = await page.getByRole('heading', { level: 2 }).allInnerTexts()
  expect(headings).toEqual([
    'از شفافیت تا هوشمندی',
    'خدمات',
    'تجربه‌ای از دل کسب‌وکار واقعی',
    'پروژه‌های در حال توسعه',
    'یادداشت‌ها و تجربه‌ها',
    'برای گفت‌وگو آماده‌ام',
  ])
})

test.describe('consult FAQ', () => {
  test('answers are readable and the pricing one is open on arrival', async ({ page }) => {
    await page.goto('/consult')

    const faq = page.locator('details').filter({ hasText: 'هزینه چقدر است؟' })
    await expect(faq).toHaveAttribute('open', '')
    await expect(faq).toContainText('۵۰ تا ۱۵۰ میلیون تومان')

    // A collapsed one opens on click and needs no JavaScript to do it.
    const collapsed = page.locator('details').filter({ hasText: 'چقدر طول می‌کشد تا جواب بدهی؟' })
    await expect(collapsed).not.toHaveAttribute('open', '')
    await collapsed.locator('summary').click()
    await expect(collapsed).toContainText('۴۸ ساعت کاری')
  })

  test('the FAQ markup matches what the page actually says', async ({ page }) => {
    // Google treats FAQ structured data that does not match the visible page as
    // a manual-action risk, so a drift between the two is worse than having no
    // markup at all. Both come from one array; this proves it stayed that way.
    await page.goto('/consult')

    const fromMarkup = await page.evaluate(() => {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
      for (const s of scripts) {
        const parsed = JSON.parse(s.textContent ?? '{}')
        if (parsed['@type'] === 'FAQPage') {
          return parsed.mainEntity.map((q: { name: string }) => q.name)
        }
      }
      return null
    })

    expect(fromMarkup).not.toBeNull()
    const questions = fromMarkup as string[]
    expect(questions.length).toBeGreaterThanOrEqual(4)

    for (const question of questions) {
      await expect(page.locator('summary').filter({ hasText: question })).toHaveCount(1)
    }
  })
})
