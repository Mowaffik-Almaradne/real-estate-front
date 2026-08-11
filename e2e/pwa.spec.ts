import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`PWA (${locale})`, () => {
    test("service worker file is reachable", async ({ request }) => {
      const response = await request.get("/sw.js")
      expect(response.status()).toBe(200)
      const body = await response.text()
      expect(body).toContain("install")
      expect(body).toContain("fetch")
    })

    test("manifest is reachable", async ({ request }) => {
      const response = await request.get("/manifest.webmanifest")
      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(body.name).toBeTruthy()
      expect(body.icons.length).toBeGreaterThan(0)
    })

    test("offline page renders", async ({ page }) => {
      await page.goto(`/${locale}/offline`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })
  })
}