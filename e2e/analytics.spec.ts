import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Analytics dashboard (${locale})`, () => {
    test("dashboard route resolves", async ({ page }) => {
      await page.goto(`/${locale}/dashboard/analytics`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("sidebar exposes Analytics link", async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const link = page.getByRole("link", {
        name: locale === "ar" ? /التحليلات/ : /Analytics/,
      })
      await expect(link.first()).toBeVisible()
    })
  })
}