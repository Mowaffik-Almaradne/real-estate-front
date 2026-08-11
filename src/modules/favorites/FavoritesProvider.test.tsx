import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { FavoritesProvider, useFavorites } from "src/modules/favorites/FavoritesProvider"

function wrapper({ children }: { children: React.ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>
}

describe("FavoritesProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it("returns empty state initially", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    expect(result.current.count).toBe(0)
    expect(result.current.ids.size).toBe(0)
    expect(result.current.isFavorite(1)).toBe(false)
  })

  it("add inserts an id and updates count", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => {
      result.current.add(10)
    })
    expect(result.current.count).toBe(1)
    expect(result.current.isFavorite(10)).toBe(true)
  })

  it("remove deletes an id and updates count", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => {
      result.current.add(10)
      result.current.add(20)
    })
    expect(result.current.count).toBe(2)
    act(() => {
      result.current.remove(10)
    })
    expect(result.current.count).toBe(1)
    expect(result.current.isFavorite(10)).toBe(false)
    expect(result.current.isFavorite(20)).toBe(true)
  })

  it("toggle returns new state and flips membership", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    let next: boolean | undefined
    act(() => {
      next = result.current.toggle(5)
    })
    expect(next).toBe(true)
    expect(result.current.isFavorite(5)).toBe(true)
    act(() => {
      next = result.current.toggle(5)
    })
    expect(next).toBe(false)
    expect(result.current.isFavorite(5)).toBe(false)
  })

  it("hydrate replaces the entire set", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => {
      result.current.hydrate([{ id: 1 }, { id: 2 }, { id: 3 }])
    })
    expect(result.current.count).toBe(3)
    expect(result.current.isFavorite(1)).toBe(true)
    expect(result.current.isFavorite(2)).toBe(true)
    expect(result.current.isFavorite(3)).toBe(true)
  })

  it("reset clears all", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => {
      result.current.add(1)
      result.current.add(2)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.count).toBe(0)
  })

  it("persists to localStorage after hydration", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    act(() => {
      result.current.add(42)
    })
    const raw = window.localStorage.getItem("favorites:ids:v1")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed).toContain(42)
  })

  it("rehydrates from localStorage on mount", () => {
    window.localStorage.setItem("favorites:ids:v1", JSON.stringify([7, 8]))
    const { result } = renderHook(() => useFavorites(), { wrapper })
    expect(result.current.count).toBe(2)
    expect(result.current.isFavorite(7)).toBe(true)
    expect(result.current.isFavorite(8)).toBe(true)
  })
})
