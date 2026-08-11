# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compare.spec.ts >> Compare flow (ar) >> /compare page resolves without crashing
- Location: e2e/compare.spec.ts:7:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('main')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('main')

```

```yaml
- text: اللغة
- combobox "اللغة":
  - option "English"
  - option "العربية" [selected]
- banner:
  - heading "مقارنة العقارات" [level=1]
  - paragraph: أضف حتى 4 عقارات لمقارنتها جنبًا إلى جنب.
- heading "لا توجد عناصر للمقارنة بعد" [level=2]
- paragraph: تصفح العقارات واضغط زر المقارنة في أي بطاقة لإضافتها هنا.
- button "تصفح العقارات"
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
  6  |   test.describe(`Compare flow (${locale})`, () => {
  7  |     test("/compare page resolves without crashing", async ({ page }) => {
  8  |       await page.goto(`/${locale}/compare`, { waitUntil: "domcontentloaded" })
  9  |       const main = page.getByRole("main")
> 10 |       await expect(main).toBeVisible()
     |                          ^ Error: expect(locator).toBeVisible() failed
  11 |     })
  12 | 
  13 |     test("empty state shows when no properties selected", async ({ page }) => {
  14 |       await page.goto(`/${locale}/compare`, { waitUntil: "domcontentloaded" })
  15 |       await expect(page.getByRole("heading", { level: 2 })).toBeVisible()
  16 |     })
  17 | 
  18 |     test("properties page shows compare toggles", async ({ page }) => {
  19 |       await page.goto(`/${locale}/properties`, { waitUntil: "domcontentloaded" })
  20 |       const compareButtons = page.getByRole("button", { name: /compare/i })
  21 |       const count = await compareButtons.count()
  22 |       expect(count).toBeGreaterThanOrEqual(0)
  23 |     })
  24 |   })
  25 | }
```