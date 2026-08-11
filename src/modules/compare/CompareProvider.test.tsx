import { describe, it, expect, beforeEach } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"

import { CompareProvider, useCompare, MAX_COMPARE_ITEMS } from "./CompareProvider"

function wrapper({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>
}

describe("CompareProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("starts empty", async () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    expect(result.current.count).toBe(0)
    expect(result.current.ids).toEqual([])
    expect(result.current.isHydrated).toBe(false)
    await act(async () => {
      await Promise.resolve()
    })
  })

  it("adds ids up to the limit", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    act(() => {
      result.current.add(1)
      result.current.add(2)
      result.current.add(3)
    })
    expect(result.current.count).toBe(3)
    expect(result.current.ids).toEqual([1, 2, 3])
  })

  it("rejects ids beyond MAX_COMPARE_ITEMS", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    act(() => {
      for (let i = 1; i <= MAX_COMPARE_ITEMS + 2; i++) {
        result.current.add(i)
      }
    })
    expect(result.current.ids).toHaveLength(MAX_COMPARE_ITEMS)
    expect(result.current.canAdd).toBe(false)
  })

  it("toggle adds when not selected", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    let nowSelected = false
    act(() => {
      nowSelected = result.current.toggle(7)
    })
    expect(nowSelected).toBe(true)
    expect(result.current.contains(7)).toBe(true)
  })

  it("toggle removes when already selected", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    act(() => {
      result.current.add(7)
    })
    let nowSelected = true
    act(() => {
      nowSelected = result.current.toggle(7)
    })
    expect(nowSelected).toBe(false)
    expect(result.current.contains(7)).toBe(false)
  })

  it("clear empties the list", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    act(() => {
      result.current.add(1)
      result.current.add(2)
      result.current.clear()
    })
    expect(result.current.count).toBe(0)
  })

  it("remove drops only the targeted id", () => {
    const { result } = renderHook(() => useCompare(), { wrapper })
    act(() => {
      result.current.add(1)
      result.current.add(2)
      result.current.remove(1)
    })
    expect(result.current.ids).toEqual([2])
  })
})