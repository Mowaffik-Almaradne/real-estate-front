import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

type Severity = "critical" | "serious"
const BLOCKING: Severity[] = ["critical"]

async function runA11yAudit(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()

  const blocking = results.violations.filter(
    (v) => v.impact && BLOCKING.includes(v.impact as Severity)
  )

  if (blocking.length > 0) {
    const summary = blocking
      .map(
        (v) =>
          `[${v.impact}] ${v.id} - ${v.description}\n` +
          `  Help: ${v.helpUrl}\n` +
          `  Nodes: ${v.nodes.length}`
      )
      .join("\n\n")
    throw new Error(`a11y violations on ${label}:\n\n${summary}`)
  }

  return results
}

const ROUTES = [
  { path: "/", label: "home" },
  { path: "/login", label: "login" },
  { path: "/register", label: "register" },
  { path: "/forgot-password", label: "forgot-password" },
  { path: "/properties", label: "properties" },
  { path: "/chat", label: "chat" },
  { path: "/settings", label: "settings" },
] as const

test.describe("a11y audit (en)", () => {
  for (const route of ROUTES) {
    test(`${route.label} has no critical WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`/en${route.path}`, { waitUntil: "domcontentloaded" })
      await page.waitForLoadState("networkidle").catch(() => {})
      await runA11yAudit(page, `en/${route.label}`)
    })
  }
})

test.describe("a11y audit (ar)", () => {
  for (const route of ROUTES) {
    test(`${route.label} (RTL) has no critical WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`/ar${route.path}`, { waitUntil: "domcontentloaded" })
      await page.waitForLoadState("networkidle").catch(() => {})
      await runA11yAudit(page, `ar/${route.label}`)
    })
  }
})

test("a11y critical baseline is clean across all routes/locales", async ({ page }) => {
  test.setTimeout(180_000)
  for (const locale of ["en", "ar"]) {
    for (const route of ROUTES) {
      await page.goto(`/${locale}${route.path}`, { waitUntil: "domcontentloaded" })
      await page.waitForLoadState("networkidle").catch(() => {})
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
      const blocking = results.violations.filter(
        (v) => v.impact && BLOCKING.includes(v.impact as Severity)
      )
      expect(
        blocking,
        `${locale}${route.path} should have no critical violations`
      ).toHaveLength(0)
    }
  }
})

test.describe("a11y inventory (serious, non-blocking)", () => {
  test("logs serious violations for tracking (not blocking CI)", async ({ page }) => {
    test.setTimeout(180_000)
    const inventory: Array<{ route: string; locale: string; serious: number; ids: string[] }> = []
    for (const locale of ["en", "ar"]) {
      for (const route of ROUTES) {
        await page.goto(`/${locale}${route.path}`, { waitUntil: "domcontentloaded" })
        await page.waitForLoadState("networkidle").catch(() => {})
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze()
        const serious = results.violations.filter((v) => v.impact === "serious")
        inventory.push({
          route: route.path,
          locale,
          serious: serious.length,
          ids: serious.map((v) => v.id),
        })
      }
    }
    const total = inventory.reduce((sum, e) => sum + e.serious, 0)
    console.log(
      `\n=== a11y serious inventory (non-blocking) ===\n` +
        inventory.map((e) => `${e.locale}${e.route}: ${e.serious} [${e.ids.join(", ")}]`).join("\n") +
        `\nTotal: ${total}\n==========================================\n`
    )
  })
})


