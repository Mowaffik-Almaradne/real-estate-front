import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Saved searches (${locale})`, () => {
    test("saved-searches page resolves", async ({ page }) => {
      await page.goto(`/${locale}/saved-searches`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("sidebar exposes Saved searches link", async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const link = page.getByRole("link", {
        name:
          locale === "ar"
            ? /عمليات البحث المحفوظة/
            : /Saved searches/,
      })
      await expect(link.first()).toBeVisible()
    })

    test("properties page exposes Save search control", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const button = page.getByTestId("open-save-search-dialog-properties")
      await expect(button).toBeVisible()
    })
  })
}