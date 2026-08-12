#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const SCAN_DIRS = ["services", "src", "lib", "components", "hooks"]
const SCAN_EXTS = new Set([".ts", ".tsx"])

const callRe =
  /apiClient\.(get|post|put|patch|delete)\s*\(\s*([^,)]+)/g

function normalizeUrl(raw) {
  const trimmed = raw.trim().replace(/[`'"]/g, "")
  const first = trimmed.split(/\s*\+\s*/)[0] ?? trimmed
  return first
}

function walk(dir, out = []) {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return out
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
    const f = path.join(full, entry.name)
    if (entry.isDirectory()) walk(path.join(dir, entry.name), out)
    else if (SCAN_EXTS.has(path.extname(entry.name))) out.push(f)
  }
  return out
}

function lineFor(content, index) {
  return content.slice(0, index).split("\n").length
}

const files = SCAN_DIRS.flatMap((d) => walk(d))

const calls = []
for (const file of files) {
  const content = fs.readFileSync(file, "utf8")
  const matches = [...content.matchAll(callRe)]
  for (const m of matches) {
    const method = m[1].toUpperCase()
    const raw = m[2].trim()
    const normalized = normalizeUrl(raw)
    const line = lineFor(content, m.index)
    calls.push({ file: path.relative(root, file), line, method, raw, normalized })
  }
}

const grouped = {}
for (const c of calls) {
  const top = c.file.split("/")[0]
  grouped[top] = grouped[top] ?? { total: 0, entries: [] }
  grouped[top].total++
  grouped[top].entries.push(c)
}

const report = {
  generatedAt: new Date().toISOString(),
  totalCalls: calls.length,
  byTopLevel: Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, { total: v.total }])
  ),
  calls,
  callsByNormalized: Object.fromEntries(
    Object.entries(
      calls.reduce((acc, c) => {
        const key = `${c.method} ${c.normalized}`
        acc[key] = acc[key] ?? { method: c.method, normalized: c.normalized, count: 0, sites: [] }
        acc[key].count++
        acc[key].sites.push(`${c.file}:${c.line}`)
        return acc
      }, {})
    )
  ),
}

const outFile = path.join(root, "docs/reports/frontend-api-calls.json")
fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(report, null, 2))

console.log(`Scanned files: ${files.length}`)
console.log(`API calls found: ${calls.length}`)
console.log(`By top-level dir:`)
for (const [k, v] of Object.entries(grouped)) {
  console.log(`  ${k}: ${v.total}`)
}
console.log(`Report: ${path.relative(root, outFile)}`)
