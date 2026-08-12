import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Mortgage + Share (${locale})`, () => {
    test("property detail page resolves", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("property page heading is visible", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("navbar exposes properties navigation", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const nav = page.getByRole("navigation", { name: /menu|القائمة/i })
      await expect(nav).toBeVisible()
    })
  })
}