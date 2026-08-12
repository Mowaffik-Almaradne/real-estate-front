import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Search & filters (${locale})`, () => {
    test("properties page exposes search input", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const input = page.locator('input[role="combobox"]')
      await expect(input).toBeVisible()
    })

    test("advanced filters toggle is visible", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const toggle = page.getByRole("button", { name: /advanced|متقدم/i }).first()
      await expect(toggle).toBeVisible()
    })

    test("URL search param syncs to input", async ({ page }) => {
      await page.goto(`/${locale}/properties?search=villa`, { waitUntil: "domcontentloaded" })
      const input = page.locator('input[role="combobox"]')
      await expect(input).toHaveValue("villa")
    })
  })
}