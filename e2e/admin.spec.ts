import { expect, test } from '@playwright/test'

/**
 * The admin path that matters: log in, write an article, publish it, and see it
 * on the public site. If this works, the site is usable as a publishing tool.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'ebrahimzarfeshan@gmail.com'
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? ''

/**
 * Next.js renders its route announcer as a permanent, empty
 * <div role="alert" id="__next-route-announcer__">, so getByRole('alert')
 * matches two elements on every page. This selects only our own messages.
 */
const ALERT = '[role="alert"]:not(#__next-route-announcer__)'


test.describe('admin', () => {
  test('the admin area is closed to a visitor', async ({ page }) => {
    await page.goto('/admin/articles')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ورود')
  })

  test('a wrong password says nothing about which addresses exist', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#email').fill('nobody-here@example.com')
    await page.locator('#password').fill('wrong-password-entirely')
    await page.getByRole('button', { name: 'ورود' }).click()

    const error = page.locator(ALERT)
    await expect(error).toBeVisible()
    // "no account with that address" would turn this into a membership oracle
    await expect(error).toContainText('ایمیل یا گذرواژه')
    await expect(error).not.toContainText('وجود ندارد')
  })

  test('an article can be written, published and read on the site', async ({ page }) => {
    test.skip(!PASSWORD, 'E2E_ADMIN_PASSWORD is not set')

    const stamp = Date.now()
    const slug = `e2e-article-${stamp}`
    const title = `مقالهٔ آزمایشی ${stamp}`

    await page.goto('/admin/login')
    await page.locator('#email').fill(EMAIL)
    await page.locator('#password').fill(PASSWORD)
    await page.getByRole('button', { name: 'ورود' }).click()
    await expect(page).toHaveURL(/\/admin$/)

    await page.goto('/admin/articles/new')
    await page.locator('#title').fill(title)
    await page.locator('#slug').fill(slug)
    await page
      .locator('#excerpt')
      .fill('این مقاله را تست خودکار ساخته است تا مسیر انتشار سرتاسر بررسی شود.')
    await page
      .locator('#body')
      .fill('## عنوان بخش\n\nمتن آزمایشی برای بررسی مسیر انتشار.\n\nپاراگراف دوم.')

    // the preview renders structure without compiling MDX in the browser
    await page.getByRole('button', { name: 'پیش‌نمایش' }).click()
    await expect(page.locator('.prose h2')).toContainText('عنوان بخش')
    await page.getByRole('button', { name: 'نوشتن' }).click()

    await page.locator('#status').selectOption('PUBLISHED')
    await page.getByRole('button', { name: 'ذخیره' }).click()
    await expect(page.getByRole('status')).toContainText('ذخیره شد')

    // and now the public side
    await page.goto(`/articles/${slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
    await expect(page.locator('.prose h2')).toContainText('عنوان بخش')

    // a fresh article carries no draft marker, so no sample notice
    await expect(page.getByText('این یک متن نمونه است')).toHaveCount(0)

    await page.goto('/articles')
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    // clean up, so repeated runs do not pile up articles
    await page.goto('/admin/articles')
    await page.getByRole('link', { name: title }).click()
    await page.getByRole('button', { name: 'حذف', exact: true }).click()
    await page.getByRole('button', { name: 'بله، حذف کن' }).click()
    await expect(page).toHaveURL(/\/admin\/articles$/)
  })
})
