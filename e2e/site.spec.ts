import { expect, test } from '@playwright/test'

/**
 * Public site: what a reader must be able to do, plus the brand rules that are
 * easy to break without anyone noticing.
 */

test('the homepage states who this is for within one screen', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('سیستم بساز، آزاد باش')
  await expect(page.getByText('برای مدیرانی که')).toBeVisible()
  await expect(page.getByRole('link', { name: 'آخرین مقالات' })).toBeVisible()
})

test('an article opens from the homepage and is readable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { level: 3 }).first().click()
  await expect(page).toHaveURL(/\/articles\//)
  await expect(page.locator('.prose p').first()).toBeVisible()
})

test('search finds a Persian word from a partial form', async ({ page }) => {
  await page.goto('/search')
  // trigram matching should reach "مستندسازی" from "مستند"
  await page.getByLabel('جست‌وجو در مقالات').fill('مستند')
  await expect(page.getByRole('link').filter({ hasText: 'فرایندی' })).toBeVisible()
})

test('a search with no matches says what to do next', async ({ page }) => {
  await page.goto('/search')
  await page.getByLabel('جست‌وجو در مقالات').fill('zzzznotfoundzzzz')
  await expect(page.getByText('چیزی پیدا نشد')).toBeVisible()
  await expect(page.getByRole('link', { name: /همهٔ مقالات/ })).toBeVisible()
})

test('the document is right-to-left and in Persian', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('dir', 'rtl')
  await expect(html).toHaveAttribute('lang', 'fa')
})

test('no page scrolls sideways', async ({ page }) => {
  for (const path of ['/', '/articles', '/about', '/consult', '/newsletter']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(1)
  }
})

test('the theme choice survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /تم/ }).click()
  const chosen = await page.locator('html').getAttribute('data-theme')
  expect(chosen).toBeTruthy()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', chosen!)
})

test('gold is never text on a light background', async ({ page }) => {
  // #C8A84B measures 2.10:1 against paper. The design rule is surfaces and
  // marks only, and this is the check that keeps it true as pages are added.
  await page.goto('/')
  const violations = await page.evaluate(() => {
    const found: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      const style = getComputedStyle(el)
      if (style.color.replace(/\s/g, '') !== 'rgb(200,168,75)') continue
      if (!(el.textContent ?? '').trim()) continue

      // walk up for the nearest painted background
      let node: Element | null = el
      let bg = 'rgba(0, 0, 0, 0)'
      while (node) {
        const c = getComputedStyle(node).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)') {
          bg = c
          break
        }
        node = node.parentElement
      }
      // paper #F5F5F0
      if (bg.replace(/\s/g, '') === 'rgb(245,245,240)') {
        found.push(`${el.tagName}: ${(el.textContent ?? '').trim().slice(0, 30)}`)
      }
    }
    return found
  })
  expect(violations).toEqual([])
})
