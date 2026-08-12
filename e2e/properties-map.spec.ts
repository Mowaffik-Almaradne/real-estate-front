import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Properties listing (${locale})`, () => {
    test("renders view-mode toggle (grid / list / map)", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const gridBtn = page.getByRole("button", { name: /grid view/i })
      const listBtn = page.getByRole("button", { name: /list view/i })
      const mapBtn = page.getByRole("button", { name: /map view/i })
      await expect(gridBtn).toBeVisible()
      await expect(listBtn).toBeVisible()
      await expect(mapBtn).toBeVisible()
    })

    test("filters sync to the URL query string", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const searchInput = page.getByPlaceholder(/name, description/i).first()
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill("villa")
        await expect(page).toHaveURL(/search=villa/)
      } else {
        test.skip(true, "search input not visible on this layout")
      }
    })

    test("map view toggle changes the active view mode", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const mapBtn = page.getByRole("button", { name: /map view/i })
      await mapBtn.click()
      await expect(mapBtn).toHaveAttribute("aria-pressed", "true", { timeout: 5000 })
    })

    test("share button is rendered", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const shareBtn = page.locator('button:has-text("Share"), button:has-text("مشاركة")').first()
      await expect(shareBtn).toBeVisible({ timeout: 5000 })
    })
  })
}
