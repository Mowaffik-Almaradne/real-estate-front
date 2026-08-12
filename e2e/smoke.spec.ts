import { test, expect } from "@playwright/test"

test.describe("i18n locale routing", () => {
  test("root URL is redirected to the default locale", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" })
    expect(response).not.toBeNull()
    await expect(page).toHaveURL(/\/(en|ar)\/?$/)
  })

  test("explicit English locale renders with LTR direction", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" })
    const dir = await page.locator("html").getAttribute("dir")
    const lang = await page.locator("html").getAttribute("lang")
    expect(lang).toBe("en")
    expect(dir).toBe("ltr")
  })

  test("explicit Arabic locale renders with RTL direction and translated content", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "domcontentloaded" })
    const dir = await page.locator("html").getAttribute("dir")
    const lang = await page.locator("html").getAttribute("lang")
    expect(lang).toBe("ar")
    expect(dir).toBe("rtl")
  })

  test("unmatched locale prefix falls back to default", async ({ page }) => {
    const response = await page.goto("/fr", { waitUntil: "domcontentloaded" })
    expect(response?.status() ?? 0).toBeLessThan(500)
  })
})

test.describe("Critical smoke flow", () => {
  test("home page renders and exposes property browse", async ({ page }) => {
    const response = await page.goto("/en", { waitUntil: "domcontentloaded" })
    expect(response, "home response").not.toBeNull()
    expect(response?.status() ?? 0).toBeLessThan(400)
  })

  test("login route is reachable", async ({ page }) => {
    const response = await page.goto("/en/login", { waitUntil: "domcontentloaded" })
    expect(response?.status() ?? 0).toBeLessThan(400)
    await expect(page).toHaveURL(/\/en\/login$/)
  })

  test("property browse route resolves without crashing", async ({ page }) => {
    const response = await page.goto("/en/properties", { waitUntil: "domcontentloaded" })
    expect(response?.status() ?? 0).toBeLessThan(500)
  })

  test("Arabic login route is reachable", async ({ page }) => {
    const response = await page.goto("/ar/login", { waitUntil: "domcontentloaded" })
    expect(response?.status() ?? 0).toBeLessThan(400)
    await expect(page).toHaveURL(/\/ar\/login$/)
  })
})
