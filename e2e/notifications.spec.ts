import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Notifications (${locale})`, () => {
    test("navbar exposes a Notifications link", async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const link = page.locator('a[href*="/notifications"]').first()
      await expect(link).toBeVisible()
    })

    test("/notifications route renders the title", async ({ page }) => {
      await page.goto(`/${locale}/notifications`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("filter tabs are rendered", async ({ page }) => {
      await page.goto(`/${locale}/notifications`, { waitUntil: "domcontentloaded" })
      const allBtn = page.getByRole("button", { name: /all|الكل/i }).first()
      const unreadBtn = page.getByRole("button", { name: /unread|غير مقروء/i }).first()
      await expect(allBtn).toBeVisible()
      await expect(unreadBtn).toBeVisible()
    })

    test("mark all as read button is visible", async ({ page }) => {
      await page.goto(`/${locale}/notifications`, { waitUntil: "domcontentloaded" })
      const btn = page.getByRole("button", { name: /mark all as read|تحديد الكل كمقروء/i })
      await expect(btn).toBeVisible()
    })
  })
}
