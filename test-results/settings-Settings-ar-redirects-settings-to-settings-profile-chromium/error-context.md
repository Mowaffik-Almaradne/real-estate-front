# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings (ar) >> redirects /settings to /settings/profile
- Location: e2e/settings.spec.ts:7:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/ar\/settings\/profile/
Received string:  "http://localhost:3000/ar/settings"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    - locator resolved to <html>…</html>
    - unexpected value "http://localhost:3000/ar/settings"
    - locator resolved to <html lang="ar" dir="rtl">…</html>
    - unexpected value "http://localhost:3000/ar/settings"
    - waiting for navigation to finish...
    - navigated to "http://localhost:3000/ar/settings/profile"

```

```yaml
- alert
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
  - heading "إعدادات الحساب" [level=1]
  - button "بحث"
  - button "الإشعارات"
  - link "تسجيل الدخول":
    - /url: /ar/login
    - button "تسجيل الدخول"
- main:
  - heading "إعدادات الحساب" [level=1]
  - paragraph: أدر هويتك، ملفك الشخصي كمنشئ، كلمة المرور، والأمان.
  - complementary:
    - navigation "أقسام الإعدادات":
      - link "الملف الشخصي":
        - /url: /ar/settings/profile
      - link "الأمان":
        - /url: /ar/settings/security
      - link "الإشعارات":
        - /url: /ar/settings/notifications
      - link "الحساب":
        - /url: /ar/settings/account
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | const LOCALES = ["en", "ar"] as const
  4  | 
  5  | for (const locale of LOCALES) {
  6  |   test.describe(`Settings (${locale})`, () => {
  7  |     test("redirects /settings to /settings/profile", async ({ page }) => {
  8  |       await page.goto(`/${locale}/settings`, { waitUntil: "domcontentloaded" })
> 9  |       await expect(page).toHaveURL(new RegExp(`/${locale}/settings/profile`))
     |                          ^ Error: expect(page).toHaveURL(expected) failed
  10 |     })
  11 | 
  12 |     test("renders all settings tabs in the sidebar", async ({ page }) => {
  13 |       await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
  14 |       const nav = page.getByRole("navigation", { name: /settings sections|أقسام الإعدادات/i })
  15 |       await expect(nav).toBeVisible()
  16 |       const tabNames = ["Profile", "Security", "Notifications", "Account"]
  17 |       if (locale === "ar") {
  18 |         tabNames.splice(0, tabNames.length, "الملف الشخصي", "الأمان", "الإشعارات", "الحساب")
  19 |       }
  20 |       for (const name of tabNames) {
  21 |         await expect(nav.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible()
  22 |       }
  23 |     })
  24 | 
  25 |     test("profile tab renders", async ({ page }) => {
  26 |       await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
  27 |       const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  28 |       await expect(heading).toBeVisible()
  29 |     })
  30 | 
  31 |     test("security tab renders", async ({ page }) => {
  32 |       await page.goto(`/${locale}/settings/security`, { waitUntil: "domcontentloaded" })
  33 |       const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  34 |       await expect(heading).toBeVisible()
  35 |     })
  36 | 
  37 |     test("notifications tab renders", async ({ page }) => {
  38 |       await page.goto(`/${locale}/settings/notifications`, { waitUntil: "domcontentloaded" })
  39 |       const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  40 |       await expect(heading).toBeVisible()
  41 |     })
  42 | 
  43 |     test("account tab renders", async ({ page }) => {
  44 |       await page.goto(`/${locale}/settings/account`, { waitUntil: "domcontentloaded" })
  45 |       const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  46 |       await expect(heading).toBeVisible()
  47 |     })
  48 | 
  49 |     test("clicking a tab navigates correctly", async ({ page }) => {
  50 |       await page.goto(`/${locale}/settings/profile`, { waitUntil: "domcontentloaded" })
  51 |       const securityLink = page
  52 |         .getByRole("navigation", { name: /settings sections|أقسام الإعدادات/i })
  53 |         .getByRole("link", { name: /Security|الأمان/i })
  54 |       await securityLink.click()
  55 |       await expect(page).toHaveURL(new RegExp(`/${locale}/settings/security`))
  56 |     })
  57 |   })
  58 | }
  59 | 
```