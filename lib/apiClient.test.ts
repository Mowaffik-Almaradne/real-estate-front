import { describe, it, expect } from "vitest"
import { ApiClientError, firstError, toFormErrors } from "./apiClient"

describe("ApiClientError", () => {
  it("exposes status and validation errors", () => {
    const error = new ApiClientError(422, "Invalid", { email: ["Required"] })
    expect(error.isValidation()).toBe(true)
    expect(error.fieldError("email")).toBe("Required")
    expect(error.fieldError("name")).toBeUndefined()
  })

  it("classifies status codes", () => {
    expect(new ApiClientError(401, "x").isUnauthorized()).toBe(true)
    expect(new ApiClientError(403, "x").isForbidden()).toBe(true)
    expect(new ApiClientError(404, "x").isNotFound()).toBe(true)
    expect(new ApiClientError(500, "x").isServerError()).toBe(true)
  })
})

describe("error helpers", () => {
  it("returns the first error message", () => {
    expect(firstError({ a: ["one"], b: ["two"] })).toBe("one")
    expect(firstError({})).toBeUndefined()
  })

  it("maps field errors to form errors", () => {
    const result = toFormErrors<{ email: string; name: string }>({
      email: ["Required", "Already taken"],
      name: ["Too short"],
    })
    expect(result.email).toBe("Required")
    expect(result.name).toBe("Too short")
  })
})
