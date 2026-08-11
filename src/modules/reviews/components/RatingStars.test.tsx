import { describe, it, expect } from "vitest"
import { RatingStars } from "src/modules/reviews/components/RatingStars"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ reviews: { stars: "{count} stars" } }}>
      {ui}
    </NextIntlClientProvider>
  )
}

describe("RatingStars", () => {
  it("renders 5 star icons", () => {
    const { container } = renderWithIntl(<RatingStars value={3} />)
    expect(container.querySelectorAll(".lucide-star").length).toBe(5)
  })

  it("sets aria-label with the rating value", () => {
    renderWithIntl(<RatingStars value={4.5} />)
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("4.5 out of 5")
    )
  })

  it("clamps values above max", () => {
    renderWithIntl(<RatingStars value={7} max={5} />)
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("5.0 out of 5")
    )
  })

  it("clamps negative values to 0", () => {
    renderWithIntl(<RatingStars value={-1} />)
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("0.0 out of 5")
    )
  })

  it("renders half star for 0.5 increments", () => {
    const { container } = renderWithIntl(<RatingStars value={3.5} />)
    expect(container.querySelectorAll(".lucide-star-half").length).toBe(1)
  })

  it("shows numeric value when showValue is true", () => {
    renderWithIntl(<RatingStars value={4.2} showValue />)
    expect(screen.getByText("4.2")).toBeInTheDocument()
  })
})