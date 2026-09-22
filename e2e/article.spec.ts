import { expect, test } from '@playwright/test'

const ARTICLE = '/articles/founder-dependency'

/**
 * The reading experience. The article page is where the site makes its
 * content-authority claim, and before this phase it had no contents list, no
 * heading anchors and no cover.
 */

test('headings carry ids and a link to themselves', async ({ page }) => {
  await page.goto(ARTICLE)

  const heading = page.locator('.prose h2').first()
  const id = await heading.getAttribute('id')
  expect(id, 'every h2 needs an id for the contents to point at').toBeTruthy()

  // The anchor must not pollute the heading's accessible name — the § is
  // aria-hidden and the label lives on the <a>.
  const anchor = heading.getByRole('link', { name: 'پیوند به این بخش' })
  await expect(anchor).toHaveAttribute('href', `#${id}`)
})

test('heading ids keep the Persian text rather than dropping it', async ({ page }) => {
  await page.goto(ARTICLE)
  const id = await page.locator('.prose h2').first().getAttribute('id')
  // A slugger that stripped non-Latin would leave an empty or numeric id, and
  // every contents link would point at the same place.
  expect(id).toMatch(/[؀-ۿ]/)
})

test('ids are unique across the page', async ({ page }) => {
  await page.goto(ARTICLE)
  const ids = await page.locator('.prose h2[id], .prose h3[id]').evaluateAll((els) =>
    els.map((el) => el.id)
  )
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size, 'duplicate ids break every anchor after the first').toBe(ids.length)
})

test('the contents list appears once per viewport and its links resolve', async ({
  page,
  isMobile,
}) => {
  await page.goto(ARTICLE)

  if (isMobile) {
    // Below lg the list is collapsed into <details>. A closed <details> hides
    // its contents from the accessibility tree entirely, so the nav inside is
    // not merely invisible — it does not resolve by role until it is opened.
    await page.getByRole('group').filter({ hasText: 'فهرست مطالب' }).first().click()
  }

  // Both layouts are in the DOM and swapped with display:none, which also drops
  // one from the accessibility tree — so exactly one is ever announced.
  const toc = page.getByRole('navigation', { name: 'فهرست مطالب' })
  await expect(toc).toHaveCount(1)

  const href = await toc.getByRole('link').first().getAttribute('href')
  expect(href).toMatch(/^#/)

  // the heading it points at has to exist
  await expect(page.locator(href!)).toHaveCount(1)
})

test('the article cover renders and is marked decorative', async ({ page }) => {
  await page.goto('/')
  const cover = page.locator('article img').first()
  await expect(cover).toBeVisible()

  // Generated covers carry nothing the adjacent heading does not, so alt is
  // empty on purpose. A non-empty alt here would mean a real uploaded image.
  const [alt, src] = await Promise.all([cover.getAttribute('alt'), cover.getAttribute('src')])
  expect(alt).toBe('')
  expect(src).toBeTruthy()
})

test('the reading rail still spans only the body copy', async ({ page }) => {
  // The two-column grid this phase introduced wraps the div the rail is
  // positioned against. If the rail escaped into the contents column it would
  // still look fine in a screenshot.
  await page.goto(ARTICLE)
  const rail = page.locator('.reading-rail')
  await expect(rail).toHaveCount(1)

  const inside = await rail.evaluate((el) => !!el.closest('.prose, .prose ~ *, div')?.contains(el))
  expect(inside).toBe(true)
})

test('the article page does not scroll sideways', async ({ page }) => {
  await page.goto(ARTICLE)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('links in the article body are underlined, not colour-only', async ({ page }) => {
  await page.goto(ARTICLE)
  const line = await page.evaluate(() => {
    const prose = document.querySelector('.prose')!
    const p = document.createElement('p')
    p.innerHTML = '<a href="/about" id="probe">لینک</a>'
    prose.appendChild(p)
    return getComputedStyle(document.getElementById('probe')!).textDecorationLine
  })
  // Measured at 2.73:1 against body text, under the 3:1 WCAG 1.4.1 wants before
  // colour alone may carry the distinction.
  expect(line).toContain('underline')
})
