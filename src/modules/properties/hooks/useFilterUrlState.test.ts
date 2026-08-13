import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mockRouterReplace = vi.fn()
const mockUsePathname = vi.fn(() => "/en/properties")
const mockUseSearchParams = vi.fn(() => new URLSearchParams())

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

import { useFilterUrlState } from "@/src/modules/properties/hooks/useFilterUrlState"
import { EMPTY_FILTERS } from "@/src/modules/properties/components/PropertyFilters"

describe("useFilterUrlState", () => {
  beforeEach(() => {
    mockRouterReplace.mockReset()
    mockUsePathname.mockReturnValue("/en/properties")
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns EMPTY_FILTERS when no params", () => {
    const { result } = renderHook(() => useFilterUrlState())
    expect(result.current.filters).toEqual(EMPTY_FILTERS)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it("parses URL params on mount", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("search=villa&property_type=villa&min_price=100000")
    )
    const { result } = renderHook(() => useFilterUrlState())
    expect(result.current.filters.search).toBe("villa")
    expect(result.current.filters.property_type).toBe("villa")
    expect(result.current.filters.min_price).toBe("100000")
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it("setFilters updates state and replaces URL", () => {
    const { result } = renderHook(() => useFilterUrlState())
    act(() => {
      result.current.setFilters({ ...EMPTY_FILTERS, search: "apartment" })
    })
    expect(mockRouterReplace).toHaveBeenCalledWith(
      "/en/properties?search=apartment",
      { scroll: false }
    )
  })

  it("does not replace when the URL is unchanged", () => {
    const { result } = renderHook(() => useFilterUrlState())
    act(() => {
      result.current.setFilters({ ...EMPTY_FILTERS })
    })
    expect(mockRouterReplace).not.toHaveBeenCalled()
  })

  it("omits default sort from URL", () => {
    const { result } = renderHook(() => useFilterUrlState())
    act(() => {
      result.current.setFilters({ ...EMPTY_FILTERS, search: "x" })
    })
    const url = mockRouterReplace.mock.calls[0]?.[0] as string
    expect(url).not.toContain("sort=")
  })

  it("reset clears URL and state", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("search=villa"))
    const { result, rerender } = renderHook(() => useFilterUrlState())
    expect(result.current.hasActiveFilters).toBe(true)
    act(() => {
      result.current.reset()
    })
    expect(mockRouterReplace).toHaveBeenCalledWith("/en/properties", { scroll: false })
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    rerender()
    expect(result.current.hasActiveFilters).toBe(false)
  })
})
