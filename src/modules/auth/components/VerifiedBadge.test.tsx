import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VerifiedBadge } from "./VerifiedBadge"

describe("VerifiedBadge", () => {
  it("renders nothing when not verified", () => {
    const { container } = render(<VerifiedBadge verified={false} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing for null or undefined", () => {
    const { container: c1 } = render(<VerifiedBadge verified={null} />)
    expect(c1.firstChild).toBeNull()
    const { container: c2 } = render(<VerifiedBadge verified={undefined} />)
    expect(c2.firstChild).toBeNull()
  })

  it("renders the default Verified label when verified", () => {
    render(<VerifiedBadge verified={true} />)
    expect(screen.getByText("Verified")).toBeInTheDocument()
  })

  it("renders a custom label", () => {
    render(<VerifiedBadge verified={true} label="Office" />)
    expect(screen.getByText("Office")).toBeInTheDocument()
  })

  it("hides the icon when showIcon is false", () => {
    const { container } = render(<VerifiedBadge verified={true} showIcon={false} />)
    expect(container.querySelector("svg")).toBeNull()
    expect(screen.getByText("Verified")).toBeInTheDocument()
  })
})
