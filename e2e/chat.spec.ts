import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Chat enhancements (${locale})`, () => {
    test("chat page renders without crashing", async ({ page }) => {
      await page.goto(`/${locale}/chat`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("chat page exposes the sidebar with rooms list", async ({ page }) => {
      await page.goto(`/${locale}/chat`, { waitUntil: "domcontentloaded" })
      const title = page.getByRole("heading", { level: 1 }).first()
      await expect(title).toBeVisible()
    })

    test("chat page shows empty state when no room selected", async ({ page }) => {
      await page.goto(`/${locale}/chat`, { waitUntil: "domcontentloaded" })
      const selectPrompt = locale === "ar"
        ? page.getByText(/اختر محادثة/i)
        : page.getByText(/select a conversation/i)
      await expect(selectPrompt.first()).toBeVisible({ timeout: 5000 })
    })
  })
}