#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const BUDGETS = {
  ".next/static/chunks": {
    maxTotalKB: 2500,
    maxLargestKB: 400,
    exclude: [".map"],
  },
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

function checkBudget() {
  let hasFailure = false
  for (const [dir, rules] of Object.entries(BUDGETS)) {
    const files = walk(dir).filter((f) => !rules.exclude.some((ext) => f.endsWith(ext)))
    const sizes = files.map((f) => ({ f, kb: fs.statSync(f).size / 1024 }))
    const total = sizes.reduce((s, x) => s + x.kb, 0)
    const largest = sizes.sort((a, b) => b.kb - a.kb)[0]

    console.log(`\n${dir}:`)
    console.log(`  total: ${total.toFixed(1)} KB (budget: ${rules.maxTotalKB} KB)`)
    console.log(`  largest: ${largest ? `${largest.kb.toFixed(1)} KB (${path.basename(largest.f)})` : "n/a"} (budget: ${rules.maxLargestKB} KB)`)
    console.log(`  top 5:`)
    sizes
      .sort((a, b) => b.kb - a.kb)
      .slice(0, 5)
      .forEach((s) => console.log(`    ${s.kb.toFixed(1).padStart(8)} KB  ${path.basename(s.f)}`))

    if (total > rules.maxTotalKB) {
      console.error(`  FAIL: total ${total.toFixed(1)} KB exceeds budget ${rules.maxTotalKB} KB`)
      hasFailure = true
    }
    if (largest && largest.kb > rules.maxLargestKB) {
      console.error(`  FAIL: largest ${largest.kb.toFixed(1)} KB exceeds budget ${rules.maxLargestKB} KB`)
      hasFailure = true
    }
  }
  process.exit(hasFailure ? 1 : 0)
}

checkBudget()
