import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"

const messages = {
  property: {
    filters: {
      saveSearch: "Save search",
      searchSaved: "Search saved",
      share: "Share",
      clearAll: "Clear all",
    },
    share: {
      button: "Share this search",
      copied: "Link copied!",
      copyFailed: "Failed to copy link",
    },
  },
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/en/properties",
  useSearchParams: () => new URLSearchParams(),
}))

const writeTextMock = vi.fn().mockResolvedValue(undefined)

Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: { writeText: writeTextMock },
})

import {
  ActiveFilterChips,
  ShareButton,
  SaveSearchButton,
} from "@/src/modules/properties/components/FilterExtras"

function renderWithProvider(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}

describe("FilterExtras", () => {
  beforeEach(() => {
    writeTextMock.mockClear()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("ActiveFilterChips renders nothing when empty", () => {
    const { container } = renderWithProvider(<ActiveFilterChips chips={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("ActiveFilterChips renders a chip with remove button", () => {
    const onRemove = vi.fn()
    renderWithProvider(
      <ActiveFilterChips
        chips={[{ key: "search", label: "villa", onRemove }]}
      />
    )
    const remove = screen.getByLabelText("Remove villa")
    fireEvent.click(remove)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it("ShareButton copies URL to clipboard and shows copied label", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost:3000/en/properties?search=villa" },
    })
    renderWithProvider(<ShareButton />)
    const btn = screen.getByRole("button", { name: /share this search/i })
    fireEvent.click(btn)
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled()
    })
    expect(writeTextMock.mock.calls[0]?.[0]).toContain("/properties")
  })

  it("SaveSearchButton opens dialog and saves to localStorage", async () => {
    renderWithProvider(<SaveSearchButton />)
    fireEvent.click(screen.getByRole("button", { name: /save search/i }))
    const input = screen.getByPlaceholderText("e.g. Apartments in Casablanca")
    fireEvent.change(input, { target: { value: "My search" } })
    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }))
    await waitFor(() => {
      const raw = window.localStorage.getItem("property:saved-searches:en")
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed[0].name).toBe("My search")
    })
  })
})
