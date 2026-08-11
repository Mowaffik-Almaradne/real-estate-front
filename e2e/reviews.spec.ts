import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Reviews (${locale})`, () => {
    test("navbar exposes a Reviews link", async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const link = page.locator('a[href*="/reviews"]').first()
      await expect(link).toBeVisible()
    })

    test("/reviews route renders the title", async ({ page }) => {
      await page.goto(`/${locale}/reviews`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("tabs are rendered (Pending + My reviews)", async ({ page }) => {
      await page.goto(`/${locale}/reviews`, { waitUntil: "domcontentloaded" })
      const pendingBtn = page.getByRole("button", {
        name: locale === "ar" ? /في الانتظار/i : /pending/i,
      })
      const mineBtn = page.getByRole("button", {
        name: locale === "ar" ? /تقييماتي/i : /my reviews/i,
      })
      await expect(pendingBtn).toBeVisible()
      await expect(mineBtn).toBeVisible()
    })

    test("property detail page is reachable", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      // Page renders without crashing (might be empty due to no backend)
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })
  })
}