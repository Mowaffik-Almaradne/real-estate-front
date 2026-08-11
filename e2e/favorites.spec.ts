import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Favorites (${locale})`, () => {
    test("navbar exposes a Favorites link", async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const link = page.locator('a[href*="/favorites"]').first()
      await expect(link).toBeVisible()
    })

    test("/favorites route renders the title", async ({ page }) => {
      await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("favorites page shows the empty state when no favorites", async ({ page }) => {
      await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
      const emptyHeading = locale === "ar"
        ? page.getByText(/لم تحفظ أي عقار بعد|لا توجد مفضلات/i).first()
        : page.getByText(/no favorites|saved any properties/i).first()
      await expect(emptyHeading).toBeVisible({ timeout: 8000 })
    })

    test("favorites page exposes a browse CTA", async ({ page }) => {
      await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
      const cta = locale === "ar"
        ? page.getByRole("button", { name: /تصفح العقارات/i }).first()
        : page.getByRole("button", { name: /browse properties/i }).first()
      await expect(cta).toBeVisible({ timeout: 8000 })
    })
  })
}
