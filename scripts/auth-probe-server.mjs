#!/usr/bin/env node
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
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
  const u = new url(req.url, `http://${req.headers.host}`)
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
    const otp = newOtp(body.identifier)
    console.log(`[mock] OTP for ${body.identifier} = ${otp}`)
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
    if (attempts > 5) {
      return send(res, 429, { message: "Too many OTP attempts. Please try again later." }, { "Retry-After": "60" })
    }
    const entry = store.otpByIdentifier.get(body.identifier)
    if (!entry || entry.expiresAt < Date.now() || entry.code !== body.code) {
      store.otpAttempts.set(body.identifier, attempts)
      return send(res, 422, {
        message: "Invalid or expired OTP code.",
        errors: { code: ["Invalid or expired OTP code."] },
      })
    }
    const user = findUserByIdentifier(body.identifier)
    const token = issueToken(user)
    store.otpByIdentifier.delete(body.identifier)
    if (user.two_factor_enabled) {
      return send(res, 200, {
        message: "OTP verified. Two-factor challenge required.",
        two_factor_required: true,
        challenge_token: token,
      })
    }
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
    await readBody(req)
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
