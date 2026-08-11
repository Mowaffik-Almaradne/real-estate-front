import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import { PublisherStatsGrid } from "src/modules/publishers/components/PublisherStatsGrid"
import type { PublisherProfileDto } from "@/types/publisher"

const messages = {
  publisher: {
    stats: {
      title: "Stats",
      properties: "Properties",
      rating: "Rating",
      reviews: "Reviews",
      memberSince: "Since",
    },
  },
}

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}

const baseProfile: PublisherProfileDto = {
  id: 1,
  name: "Alice Realty",
  publisher_type: "office",
  is_verified: true,
  description: null,
  website_url: null,
  social_links: null,
  average_rating: 4.5,
  reviews_count: 12,
  properties_count: 5,
  employees_count: 3,
  created_at: "2024-01-01T00:00:00Z",
}

describe("PublisherStatsGrid", () => {
  it("renders the title", () => {
    renderWithIntl(<PublisherStatsGrid publisher={baseProfile} />)
    expect(screen.getByText("Stats")).toBeInTheDocument()
  })

  it("renders all 4 stat values", () => {
    renderWithIntl(<PublisherStatsGrid publisher={baseProfile} />)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("4.5")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("2024")).toBeInTheDocument()
  })

  it("shows em dash when rating is null", () => {
    renderWithIntl(<PublisherStatsGrid publisher={{ ...baseProfile, average_rating: null }} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })
})