# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: favorites.spec.ts >> Favorites (en) >> favorites page exposes a browse CTA
- Location: e2e/favorites.spec.ts:27:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /browse properties/i }).first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('button', { name: /browse properties/i }).first()

```

```yaml
- status: You are offline. Showing the latest cached content.
- text: Language
- combobox "Language":
  - option "English" [selected]
  - option "العربية"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | const LOCALES = ["en", "ar"] as const
  4  | 
  5  | for (const locale of LOCALES) {
  6  |   test.describe(`Favorites (${locale})`, () => {
  7  |     test("navbar exposes a Favorites link", async ({ page }) => {
  8  |       await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
  9  |       const link = page.locator('a[href*="/favorites"]').first()
  10 |       await expect(link).toBeVisible()
  11 |     })
  12 | 
  13 |     test("/favorites route renders the title", async ({ page }) => {
  14 |       await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
  15 |       const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  16 |       await expect(heading).toBeVisible()
  17 |     })
  18 | 
  19 |     test("favorites page shows the empty state when no favorites", async ({ page }) => {
  20 |       await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
  21 |       const emptyHeading = locale === "ar"
  22 |         ? page.getByText(/لم تحفظ أي عقار بعد|لا توجد مفضلات/i).first()
  23 |         : page.getByText(/no favorites|saved any properties/i).first()
  24 |       await expect(emptyHeading).toBeVisible({ timeout: 8000 })
  25 |     })
  26 | 
  27 |     test("favorites page exposes a browse CTA", async ({ page }) => {
  28 |       await page.goto(`/${locale}/favorites`, { waitUntil: "domcontentloaded" })
  29 |       const cta = locale === "ar"
  30 |         ? page.getByRole("button", { name: /تصفح العقارات/i }).first()
  31 |         : page.getByRole("button", { name: /browse properties/i }).first()
> 32 |       await expect(cta).toBeVisible({ timeout: 8000 })
     |                         ^ Error: expect(locator).toBeVisible() failed
  33 |     })
  34 |   })
  35 | }
  36 | 
```