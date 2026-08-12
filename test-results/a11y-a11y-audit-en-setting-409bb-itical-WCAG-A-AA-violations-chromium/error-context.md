# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> a11y audit (en) >> settings has no critical WCAG A/AA violations
- Location: e2e/a11y.spec.ts:43:9

# Error details

```
Error: page.evaluate: Execution context was destroyed, most likely because of a navigation.
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - alert [ref=f1e2]
  - generic [ref=f1e4]:
    - generic [ref=f1e5]: Language
    - combobox "Language" [ref=f1e6] [cursor=pointer]:
      - option "English" [selected]
      - option "العربية"
  - generic [ref=f1e7]:
    - complementary [ref=f1e8]:
      - link "RealEstate" [ref=f1e10] [cursor=pointer]:
        - /url: /en
      - navigation "Menu" [ref=f1e17]:
        - link "Dashboard" [ref=f1e18] [cursor=pointer]:
          - /url: /en
        - link "Public Properties" [ref=f1e23] [cursor=pointer]:
          - /url: /en/properties
        - link "Favorites" [ref=f1e28] [cursor=pointer]:
          - /url: /en/favorites
        - link "Saved searches" [ref=f1e32] [cursor=pointer]:
          - /url: /en/saved-searches
        - link "Notifications" [ref=f1e36] [cursor=pointer]:
          - /url: /en/notifications
        - link "Reviews" [ref=f1e41] [cursor=pointer]:
          - /url: /en/reviews
        - link "My Viewings" [ref=f1e45] [cursor=pointer]:
          - /url: /en/dashboard/viewings
        - link "Chat" [ref=f1e50] [cursor=pointer]:
          - /url: /en/chat
        - link "Settings" [ref=f1e54] [cursor=pointer]:
          - /url: /en/settings
      - generic [ref=f1e60]:
        - paragraph [ref=f1e65]: Need help?
        - paragraph [ref=f1e66]: Check our documentation for more information.
        - button "View Docs" [ref=f1e67] [cursor=pointer]
    - generic [ref=f1e68]:
      - banner [ref=f1e69]:
        - heading "Account settings" [level=1] [ref=f1e70]
        - generic [ref=f1e71]:
          - button "Search" [ref=f1e72] [cursor=pointer]
          - switch "Toggle theme" [ref=f1e83] [cursor=pointer]
          - button "Notifications" [ref=f1e86] [cursor=pointer]
          - link [ref=f1e91] [cursor=pointer]:
            - /url: /en/login
            - button "Sign in" [ref=f1e92]
      - main [ref=f1e93]:
        - generic [ref=f1e94]:
          - generic [ref=f1e95]:
            - heading "Account settings" [level=1] [ref=f1e96]
            - paragraph [ref=f1e97]: Manage your identity, publisher profile, password, and security.
          - generic [ref=f1e98]:
            - complementary [ref=f1e99]:
              - navigation "Settings sections" [ref=f1e100]:
                - link "Profile" [ref=f1e101] [cursor=pointer]:
                  - /url: /en/settings/profile
                - link "Security" [ref=f1e105] [cursor=pointer]:
                  - /url: /en/settings/security
                - link "Notifications" [ref=f1e108] [cursor=pointer]:
                  - /url: /en/settings/notifications
                - link "Account" [ref=f1e112] [cursor=pointer]:
                  - /url: /en/settings/account
            - paragraph [ref=f1e117]: Loading account...
  - region "Notifications alt+T":
    - list:
      - listitem [ref=f1e118]:
        - generic [ref=f1e124]:
          - generic [ref=f1e125]: Network error. Check your connection and try again.
          - generic [ref=f1e126]: Status 0
      - listitem [ref=f1e127]:
        - generic [ref=f1e133]:
          - generic [ref=f1e134]: Network error. Check your connection and try again.
          - generic [ref=f1e135]: Status 0
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
> 10  |     .analyze()
      |      ^ Error: page.evaluate: Execution context was destroyed, most likely because of a navigation.
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
  91  |           .analyze()
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
```