#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const OLD = path.join(root, "docs/backend/api-documentation/openapi.yaml")
const NEW = path.join(root, "docs/backend/new-api-documentation/openapi.yaml")

const JSON_SCHEMA = yaml.JSON_SCHEMA

function loadSpec(file) {
  let raw = fs.readFileSync(file, "utf8")
  raw = raw.replace(/(^|\n)(\s*tags:\s*)\[(\w+)\]\[(\w+)\]/g, "$1$2[$3, $4]")
  const spec = yaml.load(raw, { schema: JSON_SCHEMA })
  const out = []
  const paths = spec.paths ?? {}
  for (const [p, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue
      if (!op || typeof op !== "object") continue
      out.push({
        path: p,
        method: method.toUpperCase(),
        operationId: op.operationId ?? null,
        tags: Array.isArray(op.tags) ? op.tags : op.tags ? [op.tags] : [],
        summary: op.summary ?? null,
      })
    }
  }
  return out
}

const oldList = loadSpec(OLD)
const newList = loadSpec(NEW)

const key = (e) => `${e.method} ${e.path}`

const oldMap = new Map(oldList.map((e) => [key(e), e]))
const newMap = new Map(newList.map((e) => [key(e), e]))

const added = []
const removed = []
const common = []

for (const [k, e] of newMap) {
  if (!oldMap.has(k)) added.push(e)
  else common.push(k)
}
for (const [k, e] of oldMap) {
  if (!newMap.has(k)) removed.push(e)
}

const report = {
  generatedAt: new Date().toISOString(),
  oldCount: oldList.length,
  newCount: newList.length,
  commonCount: common.length,
  addedCount: added.length,
  removedCount: removed.length,
  added: added.sort((a, b) => a.path.localeCompare(b.path)),
  removed: removed.sort((a, b) => a.path.localeCompare(b.path)),
}

const outFile = path.join(root, "docs/reports/api-contract-diff.json")
fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(report, null, 2))

console.log(`OLD endpoints: ${oldList.length}`)
console.log(`NEW endpoints: ${newList.length}`)
console.log(`Common: ${common.length}`)
console.log(`Added (new only): ${added.length}`)
console.log(`Removed (old only): ${removed.length}`)
console.log(`Report: ${path.relative(root, outFile)}`)

const mdFile = path.join(root, "docs/reports/api-contract-diff.md")
const lines = [
  "# API Contract Diff",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `- OLD endpoint count: ${oldList.length}`,
  `- NEW endpoint count: ${newList.length}`,
  `- Unchanged: ${common.length}`,
  `- Added in NEW: ${added.length}`,
  `- Removed from OLD: ${removed.length}`,
  "",
  "## Added in NEW (not in OLD)",
  "",
  "| Method | Path | Operation | Tags |",
  "|---|---|---|---|",
]
for (const e of added) {
  lines.push(`| ${e.method} | \`${e.path}\` | ${e.operationId ?? ""} | ${e.tags.join(", ")} |`)
}

lines.push("", "## Removed from OLD (not in NEW)", "", "| Method | Path | Operation | Tags |", "|---|---|---|---|")
for (const e of removed) {
  lines.push(`| ${e.method} | \`${e.path}\` | ${e.operationId ?? ""} | ${e.tags.join(", ")} |`)
}

fs.writeFileSync(mdFile, lines.join("\n"))
console.log(`Markdown: ${path.relative(root, mdFile)}`)
