import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Analytics dashboard (${locale})`, () => {
    test("dashboard route resolves", async ({ page }) => {
      await page.goto(`/${locale}/dashboard/analytics`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })
  })
}