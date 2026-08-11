# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mortgage.spec.ts >> Mortgage + Share (en) >> breadcrumbs are present
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
- text: Language
- combobox "Language":
  - option "English" [selected]
  - option "العربية"
- complementary:
  - link "RealEstate":
    - /url: /en
  - navigation "Menu":
    - link "Dashboard":
      - /url: /en
    - link "Public Properties":
      - /url: /en/properties
    - link "Favorites":
      - /url: /en/favorites
    - link "Saved searches":
      - /url: /en/saved-searches
    - link "Notifications":
      - /url: /en/notifications
    - link "Reviews":
      - /url: /en/reviews
    - link "My Viewings":
      - /url: /en/dashboard/viewings
    - link "Chat":
      - /url: /en/chat
    - link "Settings":
      - /url: /en/settings
  - paragraph: Need help?
  - paragraph: Check our documentation for more information.
  - button "View Docs"
- banner:
  - heading "Property Details" [level=1]
  - button "Search"
  - switch "Toggle theme"
  - button "Notifications"
  - link "Sign in":
    - /url: /en/login
    - button "Sign in"
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