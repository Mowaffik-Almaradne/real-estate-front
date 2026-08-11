import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Mortgage + Share (${locale})`, () => {
    test("property detail page resolves", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("breadcrumbs are present", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const nav = page.getByRole("navigation", { name: /breadcrumb|مسار/i })
      await expect(nav).toBeVisible()
    })

    test("share button is present", async ({ page }) => {
      await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
      const share = page.getByRole("button", { name: /share|مشاركة/i }).first()
      await expect(share).toBeVisible()
    })
  })
}