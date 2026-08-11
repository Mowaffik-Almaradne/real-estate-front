#!/usr/bin/env node
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import nodeUrl from "node:url"

const __dirname = path.dirname(nodeUrl.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const outDir = path.join(root, "docs/reports/auth-probes")
fs.mkdirSync(outDir, { recursive: true })

const store = {
  users: new Map([
    [
      "user@example.com",
      {
        id: 1,
        name: "Test User",
        email: "user@example.com",
        phone: "+212600000001",
        two_factor_enabled: false,
        email_verified_at: "2026-01-01T00:00:00Z",
      },
    ],
    [
      "2fa@example.com",
      {
        id: 2,
        name: "2FA User",
        email: "2fa@example.com",
        phone: "+212600000002",
        two_factor_enabled: true,
        email_verified_at: "2026-01-01T00:00:00Z",
      },
    ],
  ]),
  otpByIdentifier: new Map(),
  otpAttempts: new Map(),
  tokens: new Map(),
  lastOtp: new Map(),
}

let nextToken = 1
function issueToken(user) {
  const plain = `${nextToken++}|${Buffer.from(`${user.id}:${Date.now()}`).toString("base64")}`
  store.tokens.set(plain, { userId: user.id, createdAt: Date.now() })
  return plain
}
function findUserByIdentifier(identifier) {
  return store.users.get(identifier) ?? null
}
function newOtp(identifier) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  store.otpByIdentifier.set(identifier, { code, expiresAt: Date.now() + 5 * 60_000 })
  store.otpAttempts.set(identifier, 0)
  store.lastOtp.set(identifier, code)
  return code
}

function send(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": "4",
    ...extraHeaders,
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on("data", (c) => chunks.push(c))
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"))
      } catch {
        resolve({})
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const u = new nodeUrl.URL(req.url, `http://${req.headers.host}`)
  const route = `${req.method} ${u.pathname}`

  if (req.method === "POST" && u.pathname === "/auth/login") {
    const body = await readBody(req)
    if (!body.identifier) {
      return send(res, 422, {
        message: "The given data was invalid.",
        errors: { identifier: ["The identifier field is required."] },
      })
    }
    const user = findUserByIdentifier(body.identifier)
    if (!user) {
      return send(res, 422, {
        message: "The given data was invalid.",
        errors: { identifier: ["No account matches this identifier."] },
      })
    }
    newOtp(body.identifier)
    return send(res, 200, {
      message: "OTP sent successfully.",
      channel: "email",
      identifier: body.identifier,
    })
  }

  if (req.method === "POST" && u.pathname === "/auth/verify-otp") {
    const body = await readBody(req)
    if (!body.identifier || !body.code) {
      return send(res, 422, {
        message: "The given data was invalid.",
        errors: {
          identifier: body.identifier ? [] : ["The identifier field is required."],
          code: body.code ? [] : ["The code field is required."],
        },
      })
    }
    const attempts = (store.otpAttempts.get(body.identifier) ?? 0) + 1
    store.otpAttempts.set(body.identifier, attempts)
    if (attempts > 5) {
      return send(
        res,
        429,
        { message: "Too many OTP attempts. Please try again later." },
        { "Retry-After": "60" }
      )
    }
    const entry = store.otpByIdentifier.get(body.identifier)
    if (!entry || entry.expiresAt < Date.now() || entry.code !== body.code) {
      return send(res, 422, {
        message: "Invalid or expired OTP code.",
        errors: { code: ["Invalid or expired OTP code."] },
      })
    }
    const user = findUserByIdentifier(body.identifier)
    store.otpByIdentifier.delete(body.identifier)
    if (user.two_factor_enabled) {
      const challengeToken = issueToken(user)
      return send(res, 200, {
        message: "OTP verified. Two-factor challenge required.",
        two_factor_required: true,
        challenge_token: challengeToken,
      })
    }
    const token = issueToken(user)
    return send(res, 200, { data: { user, token } })
  }

  if (req.method === "POST" && u.pathname === "/auth/two-factor-challenge") {
    const auth = req.headers.authorization
    if (!auth?.startsWith("Bearer ")) {
      return send(res, 401, { message: "Unauthenticated." })
    }
    const body = await readBody(req)
    const user = Array.from(store.users.values()).find((u) => u.two_factor_enabled)
    if (!user) {
      return send(res, 422, { message: "Two-factor challenge is not required for this account." })
    }
    if (body.code !== "123456" && body.recovery_code !== "RECOVERY-CODE-1") {
      return send(res, 422, {
        message: "The given data was invalid.",
        errors: { code: ["The provided two factor authentication code was invalid."] },
      })
    }
    const token = issueToken(user)
    return send(res, 200, { data: { user, token } })
  }

  if (req.method === "GET" && u.pathname === "/user") {
    const auth = req.headers.authorization
    if (!auth?.startsWith("Bearer ")) {
      return send(res, 401, { message: "Unauthenticated." })
    }
    const plain = auth.replace("Bearer ", "")
    const entry = store.tokens.get(plain)
    if (!entry) return send(res, 401, { message: "Unauthenticated." })
    const user = Array.from(store.users.values()).find((u) => u.id === entry.userId)
    return send(res, 200, { data: user })
  }

  if (req.method === "POST" && u.pathname === "/auth/logout") {
    const auth = req.headers.authorization
    if (auth?.startsWith("Bearer ")) {
      store.tokens.delete(auth.replace("Bearer ", ""))
    }
    return send(res, 200, { message: "Logged out." })
  }

  if (req.method === "POST" && u.pathname === "/auth/register") {
    const body = await readBody(req)
    if (!body.name || !body.email || !body.password) {
      return send(res, 422, {
        message: "The given data was invalid.",
        errors: { name: body.name ? [] : ["The name field is required."] },
      })
    }
    const user = {
      id: store.users.size + 1,
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      two_factor_enabled: false,
      email_verified_at: null,
    }
    store.users.set(body.email, user)
    const token = issueToken(user)
    return send(res, 201, { data: { user, token } })
  }

  if (req.method === "POST" && u.pathname === "/auth/forgot-password") {
    return send(res, 200, { message: "If the account exists, a reset link has been sent." })
  }

  if (req.method === "POST" && u.pathname === "/auth/reset-password") {
    const body = await readBody(req)
    if (!body.email || !body.token || !body.password) {
      return send(res, 422, { message: "The given data was invalid." })
    }
    return send(res, 200, { message: "Password reset successfully." })
  }

  return send(res, 404, { message: `Not Found: ${route}` })
})

const port = Number(process.env.MOCK_PORT ?? 8765)
server.listen(port, "127.0.0.1", () => {
  console.log(`[mock] auth probe server listening on http://127.0.0.1:${port}`)
})

const base = `http://127.0.0.1:${port}`

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
    request: { method: "POST", path: "/auth/logout", headers: { Authorization: "Bearer 1|mock" } },
    description: "POST /auth/logout with bearer token",
  },
  {
    id: "08-me-with-token",
    request: { method: "GET", path: "/user", headers: { Authorization: "Bearer 1|mock" } },
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
    request: { method: "POST", path: "/auth/two-factor-challenge", headers: { Authorization: "Bearer 1|mock" }, body: { code: "123456" } },
    description: "POST /auth/two-factor-challenge with valid code — expect { data: { user, token } }",
  },
]

const summary = []
let otpForUser = null
let lastIssuedToken: string | null = null
void lastIssuedToken

async function runProbe(p) {
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
  return {
    attempt: 1,
    status: res.status,
    headers,
    body,
    durationMs: Date.now() - start,
  }
}

for (const p of probes) {
  const result = await runProbe(p)
  const file = path.join(outDir, `${p.id}.json`)
  fs.writeFileSync(
    file,
    JSON.stringify({ id: p.id, description: p.description, request: p.request, results: [result] }, null, 2)
  )
  summary.push({ id: p.id, status: result.status, durationMs: result.durationMs })
  console.log(`[${p.id}] status=${result.status} duration=${result.durationMs}ms`)
  if (p.id === "01-login-send-otp-email") {
    otpForUser = store.lastOtp.get("user@example.com")
  }
  void (result.body?.data?.token)
}

if (otpForUser) {
  const success = await runProbe({
    request: {
      method: "POST",
      path: "/auth/verify-otp",
      body: { identifier: "user@example.com", code: otpForUser },
    },
  })
  const file = path.join(outDir, "03-verify-otp-success.json")
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        id: "03-verify-otp-success",
        description: "POST /auth/verify-otp with correct code (captured from probe 01) — expect { data: { user, token } }",
        request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "user@example.com", code: "<redacted>" } },
        results: [
          {
            ...success,
            body: success.body.token ? { ...success.body, token: "<redacted>" } : success.body,
          },
        ],
      },
      null,
      2
    )
  )
  summary.push({ id: "03-verify-otp-success", status: success.status, durationMs: success.durationMs })
  console.log(`[03-verify-otp-success] status=${success.status} duration=${success.durationMs}ms`)
}

const user2faOtp = store.lastOtp.get("2fa@example.com")
if (!user2faOtp) {
  await runProbe({
    request: { method: "POST", path: "/auth/login", body: { identifier: "2fa@example.com" } },
  })
}

const twoFaResults = []
for (let i = 0; i < 7; i++) {
  const r = await runProbe({
    request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "2fa@example.com", code: "000000" } },
  })
  twoFaResults.push({
    attempt: i + 1,
    status: r.status,
    headers: r.headers,
    body: r.body,
    durationMs: r.durationMs,
  })
}
fs.writeFileSync(
  path.join(outDir, "12-rate-limit-otp.json"),
  JSON.stringify(
    {
      id: "12-rate-limit-otp",
      description: "POST /auth/verify-otp — 7 attempts with wrong code — expect 429 after the 5th attempt with Retry-After header",
      request: { method: "POST", path: "/auth/verify-otp", body: { identifier: "2fa@example.com", code: "000000" } },
      results: twoFaResults,
    },
    null,
    2
  )
)
const last = twoFaResults[twoFaResults.length - 1]
summary.push({ id: "12-rate-limit-otp", status: last.status, durationMs: last.durationMs })
console.log(`[12-rate-limit-otp] status=${last.status} duration=${last.durationMs}ms (after 7 wrong attempts)`)

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

server.close()
process.exit(0)
