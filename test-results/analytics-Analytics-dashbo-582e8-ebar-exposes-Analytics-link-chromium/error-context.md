# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: analytics.spec.ts >> Analytics dashboard (en) >> sidebar exposes Analytics link
- Location: e2e/analytics.spec.ts:13:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /Analytics/ }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /Analytics/ }).first()

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
  - heading "Dashboard" [level=1]
  - button "Search"
  - switch "Toggle theme"
  - button "Notifications"
  - link "Sign in":
    - /url: /en/login
    - button "Sign in"
- main:
  - heading "RealEstate Dashboard !" [level=2]
  - paragraph: Here's an overview of your real estate business.
  - text: +12.5%
  - paragraph: "248"
  - paragraph: Total Properties
  - text: +8.2%
  - paragraph: "156"
  - paragraph: Active Listings
  - text: +23.1%
  - paragraph: "89"
  - paragraph: New Leads
  - text: "-2.3%"
  - paragraph: $124.5K
  - paragraph: Revenue
  - text: Recent Activity
  - paragraph: New property listed
  - paragraph: Luxury penthouse in Downtown added
  - paragraph: 5 minutes ago
  - text: Completed
  - paragraph: New lead assigned
  - paragraph: John Smith assigned to Agent Sarah
  - paragraph: 23 minutes ago
  - text: Pending
  - paragraph: Monthly report generated
  - paragraph: March 2026 analytics report ready
  - paragraph: 1 hour ago
  - text: Completed
  - paragraph: Listing pending approval
  - paragraph: Villa listing awaiting review
  - paragraph: 2 hours ago
  - text: Pending
  - paragraph: Lead conversion
  - paragraph: Emily Davis converted to client
  - paragraph: 3 hours ago
  - text: Completed
  - paragraph: Listing rejected
  - paragraph: Commercial space requires more details
  - paragraph: 5 hours ago
  - text: Rejected
- region "Notifications alt+T":
  - list:
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
  6  |   test.describe(`Analytics dashboard (${locale})`, () => {
  7  |     test("dashboard route resolves", async ({ page }) => {
  8  |       await page.goto(`/${locale}/dashboard/analytics`, { waitUntil: "domcontentloaded" })
  9  |       const main = page.getByRole("main")
  10 |       await expect(main).toBeVisible()
  11 |     })
  12 | 
  13 |     test("sidebar exposes Analytics link", async ({ page }) => {
  14 |       await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" })
  15 |       const link = page.getByRole("link", {
  16 |         name: locale === "ar" ? /التحليلات/ : /Analytics/,
  17 |       })
> 18 |       await expect(link.first()).toBeVisible()
     |                                  ^ Error: expect(locator).toBeVisible() failed
  19 |     })
  20 |   })
  21 | }
```