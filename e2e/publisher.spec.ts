import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Publisher profile (${locale})`, () => {
    test("publisher route renders without crashing", async ({ page }) => {
      await page.goto(`/${locale}/users/1`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })
  })
}