# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mortgage.spec.ts >> Mortgage + Share (ar) >> breadcrumbs are present
- Location: e2e/mortgage.spec.ts:13:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('navigation', { name: /breadcrumb|مسار/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('navigation', { name: /breadcrumb|مسار/i })

```

```yaml
- text: اللغة
- combobox "اللغة":
  - option "English"
  - option "العربية" [selected]
- complementary:
  - link "عقاري":
    - /url: /ar
  - navigation "القائمة":
    - link "لوحة التحكم":
      - /url: /ar
    - link "العقارات العامة":
      - /url: /ar/properties
    - link "المفضلة":
      - /url: /ar/favorites
    - link "عمليات البحث المحفوظة":
      - /url: /ar/saved-searches
    - link "الإشعارات":
      - /url: /ar/notifications
    - link "التقييمات":
      - /url: /ar/reviews
    - link "زياراتي":
      - /url: /ar/dashboard/viewings
    - link "المحادثات":
      - /url: /ar/chat
    - link "الإعدادات":
      - /url: /ar/settings
  - paragraph: هل تحتاج مساعدة؟
  - paragraph: راجع وثائقنا للمزيد من المعلومات.
  - button "عرض الوثائق"
- banner:
  - heading "Property Details" [level=1]
  - button "بحث"
  - switch "Toggle theme"
  - button "الإشعارات"
  - link "تسجيل الدخول":
    - /url: /ar/login
    - button "تسجيل الدخول"
- main:
  - paragraph: Property not found
- region "Notifications alt+T":
  - list:
    - listitem: Network error. Check your connection and try again. Status 0
    - listitem: Network error. Check your connection and try again. Status 0
    - listitem: Network error. Check your connection and try again. Status 0
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | const LOCALES = ["en", "ar"] as const
  4  | 
  5  | for (const locale of LOCALES) {
  6  |   test.describe(`Mortgage + Share (${locale})`, () => {
  7  |     test("property detail page resolves", async ({ page }) => {
  8  |       await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
  9  |       const main = page.getByRole("main")
  10 |       await expect(main).toBeVisible()
  11 |     })
  12 | 
  13 |     test("breadcrumbs are present", async ({ page }) => {
  14 |       await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
  15 |       const nav = page.getByRole("navigation", { name: /breadcrumb|مسار/i })
> 16 |       await expect(nav).toBeVisible()
     |                         ^ Error: expect(locator).toBeVisible() failed
  17 |     })
  18 | 
  19 |     test("share button is present", async ({ page }) => {
  20 |       await page.goto(`/${locale}/properties/1`, { waitUntil: "domcontentloaded" })
  21 |       const share = page.getByRole("button", { name: /share|مشاركة/i }).first()
  22 |       await expect(share).toBeVisible()
  23 |     })
  24 |   })
  25 | }
```