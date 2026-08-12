# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> a11y inventory (serious, non-blocking) >> logs serious violations for tracking (not blocking CI)
- Location: e2e/a11y.spec.ts:82:7

# Error details

```
Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
```

# Page snapshot

```yaml
- generic [active] [ref=f7e1]:
  - alert [ref=f7e2]
  - generic [ref=f7e4]:
    - generic [ref=f7e5]: Language
    - combobox "Language" [ref=f7e6] [cursor=pointer]:
      - option "English" [selected]
      - option "العربية"
  - generic [ref=f7e7]:
    - complementary [ref=f7e8]:
      - link "RealEstate" [ref=f7e10] [cursor=pointer]:
        - /url: /en
      - navigation "Menu" [ref=f7e17]:
        - link "Dashboard" [ref=f7e18] [cursor=pointer]:
          - /url: /en
        - link "Public Properties" [ref=f7e23] [cursor=pointer]:
          - /url: /en/properties
        - link "Favorites" [ref=f7e28] [cursor=pointer]:
          - /url: /en/favorites
        - link "Saved searches" [ref=f7e32] [cursor=pointer]:
          - /url: /en/saved-searches
        - link "Notifications" [ref=f7e36] [cursor=pointer]:
          - /url: /en/notifications
        - link "Reviews" [ref=f7e41] [cursor=pointer]:
          - /url: /en/reviews
        - link "My Viewings" [ref=f7e45] [cursor=pointer]:
          - /url: /en/dashboard/viewings
        - link "Chat" [ref=f7e50] [cursor=pointer]:
          - /url: /en/chat
        - link "Settings" [ref=f7e54] [cursor=pointer]:
          - /url: /en/settings
      - generic [ref=f7e60]:
        - paragraph [ref=f7e65]: Need help?
        - paragraph [ref=f7e66]: Check our documentation for more information.
        - button "View Docs" [ref=f7e67] [cursor=pointer]
    - generic [ref=f7e68]:
      - banner [ref=f7e69]:
        - heading "Account settings" [level=1] [ref=f7e70]
        - generic [ref=f7e71]:
          - button "Search" [ref=f7e72] [cursor=pointer]
          - switch "Toggle theme" [ref=f7e83] [cursor=pointer]
          - button "Notifications" [ref=f7e86] [cursor=pointer]
          - link [ref=f7e91] [cursor=pointer]:
            - /url: /en/login
            - button "Sign in" [ref=f7e92]
      - main [ref=f7e93]:
        - generic [ref=f7e94]:
          - generic [ref=f7e95]:
            - heading "Account settings" [level=1] [ref=f7e96]
            - paragraph [ref=f7e97]: Manage your identity, publisher profile, password, and security.
          - generic [ref=f7e98]:
            - complementary [ref=f7e99]:
              - navigation "Settings sections" [ref=f7e100]:
                - link "Profile" [ref=f7e101] [cursor=pointer]:
                  - /url: /en/settings/profile
                - link "Security" [ref=f7e105] [cursor=pointer]:
                  - /url: /en/settings/security
                - link "Notifications" [ref=f7e108] [cursor=pointer]:
                  - /url: /en/settings/notifications
                - link "Account" [ref=f7e112] [cursor=pointer]:
                  - /url: /en/settings/account
            - paragraph [ref=f7e117]: Loading account...
  - region "Notifications alt+T":
    - list:
      - listitem [ref=f7e118]:
        - generic [ref=f7e124]:
          - generic [ref=f7e125]: Network error. Check your connection and try again.
          - generic [ref=f7e126]: Status 0
      - listitem [ref=f7e127]:
        - generic [ref=f7e133]:
          - generic [ref=f7e134]: Network error. Check your connection and try again.
          - generic [ref=f7e135]: Status 0
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test"
  2   | import AxeBuilder from "@axe-core/playwright"
  3   | 
  4   | type Severity = "critical" | "serious"
  5   | const BLOCKING: Severity[] = ["critical"]
  6   | 
  7   | async function runA11yAudit(page: Page, label: string) {
  8   |   const results = await new AxeBuilder({ page })
  9   |     .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  10  |     .analyze()
  11  | 
  12  |   const blocking = results.violations.filter(
  13  |     (v) => v.impact && BLOCKING.includes(v.impact as Severity)
  14  |   )
  15  | 
  16  |   if (blocking.length > 0) {
  17  |     const summary = blocking
  18  |       .map(
  19  |         (v) =>
  20  |           `[${v.impact}] ${v.id} - ${v.description}\n` +
  21  |           `  Help: ${v.helpUrl}\n` +
  22  |           `  Nodes: ${v.nodes.length}`
  23  |       )
  24  |       .join("\n\n")
  25  |     throw new Error(`a11y violations on ${label}:\n\n${summary}`)
  26  |   }
  27  | 
  28  |   return results
  29  | }
  30  | 
  31  | const ROUTES = [
  32  |   { path: "/", label: "home" },
  33  |   { path: "/login", label: "login" },
  34  |   { path: "/register", label: "register" },
  35  |   { path: "/forgot-password", label: "forgot-password" },
  36  |   { path: "/properties", label: "properties" },
  37  |   { path: "/chat", label: "chat" },
  38  |   { path: "/settings", label: "settings" },
  39  | ] as const
  40  | 
  41  | test.describe("a11y audit (en)", () => {
  42  |   for (const route of ROUTES) {
  43  |     test(`${route.label} has no critical WCAG A/AA violations`, async ({ page }) => {
  44  |       await page.goto(`/en${route.path}`, { waitUntil: "domcontentloaded" })
  45  |       await page.waitForLoadState("networkidle").catch(() => {})
  46  |       await runA11yAudit(page, `en/${route.label}`)
  47  |     })
  48  |   }
  49  | })
  50  | 
  51  | test.describe("a11y audit (ar)", () => {
  52  |   for (const route of ROUTES) {
  53  |     test(`${route.label} (RTL) has no critical WCAG A/AA violations`, async ({ page }) => {
  54  |       await page.goto(`/ar${route.path}`, { waitUntil: "domcontentloaded" })
  55  |       await page.waitForLoadState("networkidle").catch(() => {})
  56  |       await runA11yAudit(page, `ar/${route.label}`)
  57  |     })
  58  |   }
  59  | })
  60  | 
  61  | test("a11y critical baseline is clean across all routes/locales", async ({ page }) => {
  62  |   test.setTimeout(180_000)
  63  |   for (const locale of ["en", "ar"]) {
  64  |     for (const route of ROUTES) {
  65  |       await page.goto(`/${locale}${route.path}`, { waitUntil: "domcontentloaded" })
  66  |       await page.waitForLoadState("networkidle").catch(() => {})
  67  |       const results = await new AxeBuilder({ page })
  68  |         .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  69  |         .analyze()
  70  |       const blocking = results.violations.filter(
  71  |         (v) => v.impact && BLOCKING.includes(v.impact as Severity)
  72  |       )
  73  |       expect(
  74  |         blocking,
  75  |         `${locale}${route.path} should have no critical violations`
  76  |       ).toHaveLength(0)
  77  |     }
  78  |   }
  79  | })
  80  | 
  81  | test.describe("a11y inventory (serious, non-blocking)", () => {
  82  |   test("logs serious violations for tracking (not blocking CI)", async ({ page }) => {
  83  |     test.setTimeout(180_000)
  84  |     const inventory: Array<{ route: string; locale: string; serious: number; ids: string[] }> = []
  85  |     for (const locale of ["en", "ar"]) {
  86  |       for (const route of ROUTES) {
  87  |         await page.goto(`/${locale}${route.path}`, { waitUntil: "domcontentloaded" })
  88  |         await page.waitForLoadState("networkidle").catch(() => {})
  89  |         const results = await new AxeBuilder({ page })
  90  |           .withTags(["wcag2a", "wcag2aa"])
> 91  |           .analyze()
      |            ^ Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
  92  |         const serious = results.violations.filter((v) => v.impact === "serious")
  93  |         inventory.push({
  94  |           route: route.path,
  95  |           locale,
  96  |           serious: serious.length,
  97  |           ids: serious.map((v) => v.id),
  98  |         })
  99  |       }
  100 |     }
  101 |     const total = inventory.reduce((sum, e) => sum + e.serious, 0)
  102 |     console.log(
  103 |       `\n=== a11y serious inventory (non-blocking) ===\n` +
  104 |         inventory.map((e) => `${e.locale}${e.route}: ${e.serious} [${e.ids.join(", ")}]`).join("\n") +
  105 |         `\nTotal: ${total}\n==========================================\n`
  106 |     )
  107 |   })
  108 | })
  109 | 
  110 | 
  111 | 
```