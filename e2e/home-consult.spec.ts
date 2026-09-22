import { expect, test } from '@playwright/test'

test('the first h3 on the homepage is still an article link', async ({ page }) => {
  // The load-bearing constraint for this phase. e2e/site.spec.ts clicks the
  // first level-3 heading and expects to land on an article; anything new added
  // above the article list must not introduce one.
  await page.goto('/')
  const first = page.getByRole('heading', { level: 3 }).first()
  const href = await first.locator('xpath=ancestor-or-self::a[1]').getAttribute('href')
  expect(href).toMatch(/^\/articles\//)
})

test('the process block is an ordered list, not three headings in a row', async ({ page }) => {
  await page.goto('/')
  const steps = page.locator('ol.steps > li')
  await expect(steps).toHaveCount(3)

  // The numbering has to be real — the counter is what makes it a sequence to
  // anything that is not looking at it.
  const marker = await steps.first().evaluate(
    (el) => getComputedStyle(el, '::before').content
  )
  expect(marker).not.toBe('none')
})

test('the topic chips on the homepage do not claim to be the current page', async ({ page }) => {
  // They are navigation here, not a filter state: the homepage is not a topic
  // listing, so aria-current="page" would be a lie to a screen reader.
  await page.goto('/')
  const chips = page.getByRole('navigation', { name: 'موضوع‌ها' })
  await expect(chips).toBeVisible()
  await expect(chips.locator('[aria-current]')).toHaveCount(0)

  // ...while the same component still marks the current page on /articles.
  await page.goto('/articles')
  await expect(
    page.getByRole('navigation', { name: 'موضوع‌ها' }).locator('[aria-current="page"]')
  ).toHaveCount(1)
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
