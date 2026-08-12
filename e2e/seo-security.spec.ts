import { test, expect } from "@playwright/test"

const LOCALES = ["en", "ar"] as const

test.describe("SEO & security", () => {
  test("sitemap.xml is reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml")
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain("<urlset")
    expect(body).toContain("/properties")
    expect(body).toContain("/favorites")
  })

  test("robots.txt is reachable", async ({ request }) => {
    const response = await request.get("/robots.txt")
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain("User-Agent")
    expect(body).toContain("Disallow: /api/")
    expect(body).toContain("Sitemap")
  })

  test("security headers are present", async ({ request }) => {
    const response = await request.get("/")
    const headers = response.headers()
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin")
    expect(headers["permissions-policy"]).toContain("camera=()")
    expect(headers["strict-transport-security"]).toContain("max-age")
    expect(headers["content-security-policy"]).toContain("default-src 'self'")
  })

  for (const locale of LOCALES) {
    test(`(${locale}) home page has OG metadata`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content")
      expect(ogTitle).toBeTruthy()
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content")
      expect(ogImage).toBeTruthy()
    })

    test(`(${locale}) home page has canonical link`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
      expect(canonical).toContain(`/${locale}`)
    })

    test(`(${locale}) home page has hreflang alternates`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
      const enHref = await page.locator('link[rel="alternate"][hreflang="en"]').count()
      const arHref = await page.locator('link[rel="alternate"][hreflang="ar"]').count()
      expect(enHref).toBeGreaterThan(0)
      expect(arHref).toBeGreaterThan(0)
    })

    test(`(${locale}) 404 page renders`, async ({ page }) => {
      const response = await page.goto(`/${locale}/this-page-does-not-exist-1234`, {
        waitUntil: "domcontentloaded",
      })
      expect(response?.status()).toBe(404)
      const heading = page.getByRole("heading", { level: 1 })
      await expect(heading).toBeVisible()
    })
  }
})
