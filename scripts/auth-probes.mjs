#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const outDir = path.join(root, "docs/reports/auth-probes")
fs.mkdirSync(outDir, { recursive: true })

const base = process.env.MOCK_BASE ?? "http://127.0.0.1:8765"

const probes = [
  {
    id: "01-login-send-otp-email",
    request: { method: "POST", path: "/auth/login", body: { identifier: "user@example.com" } },
    description: "POST /auth/login with email identifier — expect OTP sent envelope",
  },
  {
    id: "02-login-send-otp-phone",
    request: { method: "POST", path: "/auth/login", body: { identifier: "+212600000001" } },
    description: "POST /auth/login with phone identifier — confirm field accepts phone",
  },
  {
    id: "03-verify-otp-success",
    request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "user@example.com", code: "NEEDS_REAL_OTP" } },
    description: "POST /auth/verify-otp (success path mocked via separate script)",
    skip: true,
  },
  {
    id: "04-verify-otp-wrong-code",
    request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "user@example.com", code: "000000" } },
    description: "POST /auth/verify-otp with wrong code — expect 422 with errors.code",
  },
  {
    id: "05-login-missing-identifier",
    request: { method: "POST", path: "/auth/login", body: {} },
    description: "POST /auth/login with empty body — expect 422",
  },
  {
    id: "06-register-success",
    request: { method: "POST", path: "/auth/register", body: { name: "Alice", email: "alice@example.com", password: "secret123" } },
    description: "POST /auth/register — expect 201 with { data: { user, token } }",
  },
  {
    id: "07-logout-with-token",
    request: { method: "POST", path: "/auth/logout", headers: { Authorization: "Bearer MOCK" } },
    description: "POST /auth/logout with bearer token",
  },
  {
    id: "08-me-with-token",
    request: { method: "GET", path: "/user", headers: { Authorization: "Bearer MOCK" } },
    description: "GET /user with bearer token",
  },
  {
    id: "09-forgot-password",
    request: { method: "POST", path: "/auth/forgot-password", body: { email: "user@example.com" } },
    description: "POST /auth/forgot-password",
  },
  {
    id: "10-reset-password",
    request: { method: "POST", path: "/auth/reset-password", body: { email: "user@example.com", token: "abc", password: "newpass123", password_confirmation: "newpass123" } },
    description: "POST /auth/reset-password",
  },
  {
    id: "11-2fa-challenge",
    request: { method: "POST", path: "/auth/two-factor-challenge", headers: { Authorization: "Bearer MOCK_2FA" }, body: { code: "123456" } },
    description: "POST /auth/two-factor-challenge with valid code — expect { data: { user, token } }",
  },
  {
    id: "12-rate-limit-otp",
    request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "user@example.com", code: "000000" } },
    description: "POST /auth/verify-otp — 6th attempt — expect 429 with Retry-After",
    repeat: 6,
  },
]

const summary = []

for (const p of probes) {
  if (p.skip) {
    console.log(`[skip] ${p.id}`)
    continue
  }
  const repeats = p.repeat ?? 1
  const results = []
  for (let i = 0; i < repeats; i++) {
    const start = Date.now()
    const res = await fetch(`${base}${p.request.path}`, {
      method: p.request.method,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(p.request.headers ?? {}) },
      body: p.request.body ? JSON.stringify(p.request.body) : undefined,
    })
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
    const headers = {}
    res.headers.forEach((v, k) => (headers[k] = v))
    results.push({ attempt: i + 1, status: res.status, headers, body, durationMs: Date.now() - start })
  }
  const file = path.join(outDir, `${p.id}.json`)
  const out = {
    id: p.id,
    description: p.description,
    request: p.request,
    results,
  }
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  const last = results[results.length - 1]
  summary.push({ id: p.id, status: last.status, durationMs: last.durationMs })
  console.log(`[${p.id}] status=${last.status} duration=${last.durationMs}ms`)
}

const summaryFile = path.join(outDir, "summary.json")
fs.writeFileSync(
  summaryFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      base,
      results: summary,
    },
    null,
    2
  )
)
console.log(`\nSummary: ${summaryFile}`)
