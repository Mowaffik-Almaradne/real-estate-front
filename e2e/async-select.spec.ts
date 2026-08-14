import { test, expect } from "@playwright/test"

test.describe("AsyncSelect smoke", () => {
  test("deposits dashboard route is reachable", async ({ page }) => {
    const response = await page.goto("/en/dashboard/deposits", {
      waitUntil: "domcontentloaded",
    })
    expect(response, "deposits response").not.toBeNull()
    expect(response?.status() ?? 0).toBeLessThan(500)
    await expect(page).toHaveURL(/\/(en|ar)\/dashboard\/deposits$/)
  })

  test("rental-cards dashboard route is reachable", async ({ page }) => {
    const response = await page.goto("/en/dashboard/rental-cards", {
      waitUntil: "domcontentloaded",
    })
    expect(response, "rental-cards response").not.toBeNull()
    expect(response?.status() ?? 0).toBeLessThan(500)
    await expect(page).toHaveURL(/\/(en|ar)\/dashboard\/rental-cards$/)
  })

  test("ads dashboard route is reachable", async ({ page }) => {
    const response = await page.goto("/en/dashboard/ads", {
      waitUntil: "domcontentloaded",
    })
    expect(response, "ads response").not.toBeNull()
    expect(response?.status() ?? 0).toBeLessThan(500)
    await expect(page).toHaveURL(/\/(en|ar)\/dashboard\/ads$/)
  })
})
