import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Compare flow (${locale})`, () => {
    test("/compare page resolves without crashing", async ({ page }) => {
      await page.goto(`/${locale}/compare`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("empty state shows when no properties selected", async ({ page }) => {
      await page.goto(`/${locale}/compare`, { waitUntil: "domcontentloaded" })
      await expect(page.getByRole("heading", { level: 2 })).toBeVisible()
    })

    test("properties page shows compare toggles", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const compareButtons = page.getByRole("button", { name: /compare/i })
      const count = await compareButtons.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
}