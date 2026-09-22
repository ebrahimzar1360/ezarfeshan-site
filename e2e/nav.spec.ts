import { expect, test } from '@playwright/test'

/**
 * Navigation and discovery. The mobile menu used to be a bare <details>: no
 * focus trap, no Escape, and it stayed open across a navigation. These assert
 * the three behaviours that were missing, plus the palette and pagination.
 */

test.describe('mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'the sheet only exists below md')

  test('opens, traps focus, closes on Escape, and returns focus to the trigger', async ({
    page,
  }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'باز کردن منو' })
    await trigger.click()

    const sheet = page.getByRole('dialog', { name: 'ناوبری سایت' })
    await expect(sheet).toBeVisible()

    // The browser's own focus trap: focus must be inside the dialog, which is
    // the whole reason for using <dialog> over a plain div.
    const focusInside = await page.evaluate(() => {
      const dialog = document.querySelector('dialog[open]')
      return !!dialog && !!document.activeElement && dialog.contains(document.activeElement)
    })
    expect(focusInside).toBe(true)

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('closes itself when you navigate', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'باز کردن منو' }).click()

    const sheet = page.getByRole('dialog', { name: 'ناوبری سایت' })
    await sheet.getByRole('link', { name: 'مقالات' }).click()

    await expect(page).toHaveURL(/\/articles$/)
    await expect(sheet).toBeHidden()
  })

  test('locks the page behind it', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'باز کردن منو' }).click()
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
    expect(overflow).toBe('hidden')
  })
})

test.describe('command palette', () => {
  test.skip(({ isMobile }) => isMobile, 'the trigger is a desktop control')

  test('opens with Ctrl+K, finds an article, and closes on Escape', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')

    const palette = page.getByRole('dialog', { name: 'جست‌وجوی سریع' })
    await expect(palette).toBeVisible()

    await page.getByLabel('عبارت جست‌وجو').fill('مستند')
    await expect(palette.getByRole('option').filter({ hasText: 'مستند' }).first()).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(palette).toBeHidden()
  })

  test('does not steal the shortcut from a form field', async ({ page }) => {
    await page.goto('/newsletter')
    await page.getByPlaceholder('you@example.com').click()
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'جست‌وجوی سریع' })).toBeHidden()
  })

  test('gives the trigger, the dialog and the field three distinct names', async ({ page }) => {
    // One string across all three announced identically to a screen reader and
    // made getByLabel resolve to three elements.
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'باز کردن جست‌وجوی سریع' })).toHaveCount(1)
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'جست‌وجوی سریع' })).toHaveCount(1)
    await expect(page.getByLabel('عبارت جست‌وجو')).toHaveCount(1)
  })

  test('leaves the /search page label unambiguous', async ({ page }) => {
    // Regression guard: if the palette ever reuses the #q label, this call
    // resolves to two elements and Playwright's strict mode fails here rather
    // than in whichever suite runs next.
    await page.goto('/search')
    await expect(page.getByLabel('جست‌وجو در مقالات')).toHaveCount(1)
  })
})

test.describe('topics and pagination', () => {
  test('a topic chip marks itself current and leads back to everything', async ({ page }) => {
    await page.goto('/articles')

    const all = page.getByRole('navigation', { name: 'موضوع‌ها' }).getByRole('link', { name: 'همه' })
    await expect(all).toHaveAttribute('aria-current', 'page')

    await page.goto('/topics/system-building')
    await expect(
      page.getByRole('navigation', { name: 'موضوع‌ها' }).getByRole('link', { name: /سیستم/ }).first()
    ).toHaveAttribute('aria-current', 'page')
  })

  test('page 1 is canonicalised to the bare list URL', async ({ page }) => {
    await page.goto('/articles/page/1')
    await expect(page).toHaveURL(/\/articles$/)
  })

  test('the pagination control is absent while everything fits on one page', async ({ page }) => {
    // Six seeded articles against PER_PAGE of 12. Asserting the absence is the
    // honest test here: lowering PER_PAGE to manufacture a second page would be
    // fitting production config to the fixtures.
    await page.goto('/articles')
    await expect(page.getByRole('navigation', { name: 'صفحه‌بندی' })).toHaveCount(0)
  })

  test('a page past the end says so', async ({ page }) => {
    // Status is 200 rather than 404 — a pre-existing framework issue recorded in
    // docs/OPEN-QUESTIONS.md §16. What a reader sees is what is asserted here.
    await page.goto('/articles/page/2')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('این صفحه وجود ندارد')
  })
})

test('breadcrumb and JSON-LD describe the same trail', async ({ page }) => {
  await page.goto('/topics/system-building')

  const crumbs = await page
    .getByRole('navigation', { name: 'مسیر' })
    .getByRole('listitem')
    .allInnerTexts()

  const jsonLd = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
    for (const s of scripts) {
      const parsed = JSON.parse(s.textContent ?? '{}')
      if (parsed['@type'] === 'BreadcrumbList') {
        return parsed.itemListElement.map((i: { name: string }) => i.name)
      }
    }
    return null
  })

  expect(jsonLd).not.toBeNull()
  expect(jsonLd).toHaveLength(crumbs.length)
  for (const [i, name] of (jsonLd as string[]).entries()) {
    expect(crumbs[i]).toContain(name)
  }
})
