import { describe, it, expect } from "vitest"
import { calculatePasswordStrength } from "src/modules/auth/components/PasswordStrengthMeter"

describe("calculatePasswordStrength", () => {
  it("returns very weak for empty password", () => {
    expect(calculatePasswordStrength("")).toEqual({
      score: 0,
      label: "veryWeak",
      color: "bg-red-500",
    })
  })

  it("rates short lowercase-only password as weak", () => {
    const result = calculatePasswordStrength("hello")
    expect(result.score).toBe(0)
    expect(result.label).toBe("veryWeak")
  })

  it("rates 8+ chars with mixed case as fair", () => {
    const result = calculatePasswordStrength("HelloWorld")
    expect(result.score).toBe(2)
    expect(result.label).toBe("fair")
  })

  it("rates alphanumeric 8+ chars as good", () => {
    const result = calculatePasswordStrength("Hello1234")
    expect(result.score).toBe(3)
    expect(result.label).toBe("good")
  })

  it("rates 12+ chars with special char as strong", () => {
    const result = calculatePasswordStrength("HelloWorld123!")
    expect(result.score).toBe(4)
    expect(result.label).toBe("strong")
  })

  it("rates 12+ chars without special char as good", () => {
    const result = calculatePasswordStrength("HelloWorld12345")
    expect(result.score).toBe(3)
    expect(result.label).toBe("good")
  })

  it("rates 16+ chars with special char as strong", () => {
    const result = calculatePasswordStrength("HelloWorld1234567!")
    expect(result.score).toBe(4)
    expect(result.label).toBe("strong")
  })
})
