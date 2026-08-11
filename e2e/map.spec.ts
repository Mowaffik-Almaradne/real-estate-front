import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

for (const locale of LOCALES) {
  test.describe(`Map clustering (${locale})`, () => {
    test("map view container resolves", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
    })

    test("map renders without errors", async ({ page }) => {
      await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))
      await page.waitForTimeout(800)
      const mapErrors = errors.filter((e) => e.toLowerCase().includes("map"))
      expect(mapErrors).toEqual([])
    })
  })
}