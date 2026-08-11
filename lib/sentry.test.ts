import { describe, it, expect, vi, beforeEach } from "vitest"
import { ApiClientError } from "@/lib/apiClient"
import { isCapturableApiError, reportApiError, setSentryUser, reportHandledException } from "./sentry"

const captureException = vi.fn()
const setUser = vi.fn()

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureException(...args),
  setUser: (...args: unknown[]) => setUser(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeError(status: number, message = "boom"): ApiClientError {
  return new ApiClientError(status, message, {})
}

describe("isCapturableApiError", () => {
  it("captures 5xx server errors", () => {
    expect(isCapturableApiError(makeError(500))).toBe(true)
    expect(isCapturableApiError(makeError(502))).toBe(true)
    expect(isCapturableApiError(makeError(503))).toBe(true)
    expect(isCapturableApiError(makeError(504))).toBe(true)
  })

  it("captures 403 forbidden errors", () => {
    expect(isCapturableApiError(makeError(403))).toBe(true)
  })

  it("skips 4xx client errors (user-fixable)", () => {
    expect(isCapturableApiError(makeError(400))).toBe(false)
    expect(isCapturableApiError(makeError(401))).toBe(false)
    expect(isCapturableApiError(makeError(404))).toBe(false)
    expect(isCapturableApiError(makeError(409))).toBe(false)
    expect(isCapturableApiError(makeError(422))).toBe(false)
  })

  it("skips network errors (status 0)", () => {
    expect(isCapturableApiError(makeError(0))).toBe(false)
  })
})

describe("reportApiError", () => {
  it("captures 5xx errors with status_code tag and extra context", () => {
    const err = makeError(500, "Internal Server Error")
    reportApiError(err, { endpoint: "/api/properties" })
    expect(captureException).toHaveBeenCalledWith(err, {
      tags: { api_error: "true", status_code: "500" },
      extra: { endpoint: "/api/properties" },
    })
  })

  it("does not capture 4xx errors", () => {
    reportApiError(makeError(404))
    expect(captureException).not.toHaveBeenCalled()
  })

  it("does not capture when no context is provided", () => {
    reportApiError(makeError(500))
    expect(captureException).toHaveBeenCalledTimes(1)
    expect(captureException).toHaveBeenCalledWith(expect.any(ApiClientError), {
      tags: { api_error: "true", status_code: "500" },
      extra: undefined,
    })
  })
})

describe("setSentryUser", () => {
  it("sets user with string id and email", () => {
    setSentryUser({ id: 42, email: "user@example.com" })
    expect(setUser).toHaveBeenCalledWith({ id: "42", email: "user@example.com" })
  })

  it("accepts string id input", () => {
    setSentryUser({ id: "user_abc", email: "test@example.com" })
    expect(setUser).toHaveBeenCalledWith({ id: "user_abc", email: "test@example.com" })
  })

  it("clears user when null is passed", () => {
    setSentryUser(null)
    expect(setUser).toHaveBeenCalledWith(null)
  })
})

describe("reportHandledException", () => {
  it("captures any error with optional context", () => {
    const err = new Error("oops")
    reportHandledException(err, { source: "manual" })
    expect(captureException).toHaveBeenCalledWith(err, { extra: { source: "manual" } })
  })

  it("captures without context", () => {
    reportHandledException("string error")
    expect(captureException).toHaveBeenCalledWith("string error", { extra: undefined })
  })
})
