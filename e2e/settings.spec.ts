import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Settings (${locale})`, () => {
    test("redirects /settings to /settings/profile", async ({ page }) => {
      await page.goto(`/${locale}/settings`, { waitUntil: "domcontentloaded" })
      await expect(page).toHaveURL(new RegExp(`/${locale}/settings/profile`))
    })

    test("renders all settings tabs in the sidebar", async ({ page }) => {
      await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
      const nav = page.getByRole("navigation", { name: /settings sections|أقسام الإعدادات/i })
      await expect(nav).toBeVisible()
      const tabNames = ["Profile", "Security", "Notifications", "Account"]
      if (locale === "ar") {
        tabNames.splice(0, tabNames.length, "الملف الشخصي", "الأمان", "الإشعارات", "الحساب")
      }
      for (const name of tabNames) {
        await expect(nav.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible()
      }
    })

    test("profile tab renders", async ({ page }) => {
      await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("security tab renders", async ({ page }) => {
      await page.goto(`/${locale}/settings/security`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("notifications tab renders", async ({ page }) => {
      await page.goto(`/${locale}/settings/notifications`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("account tab renders", async ({ page }) => {
      await page.goto(`/${locale}/settings/account`, { waitUntil: "domcontentloaded" })
      const heading = page.getByRole("main").getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })

    test("clicking a tab navigates correctly", async ({ page }) => {
      await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
      const securityLink = page
        .getByRole("navigation", { name: /settings sections|أقسام الإعدادات/i })
        .getByRole("link", { name: /Security|الأمان/i })
      await securityLink.click()
      await expect(page).toHaveURL(new RegExp(`/${locale}/settings/security`))
    })
  })
}
