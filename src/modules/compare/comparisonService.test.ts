import { describe, it, expect, beforeEach } from "vitest"

import {
  addCompareId,
  isCompareFull,
  loadCompareIds,
  removeCompareId,
  saveCompareIds,
} from "./comparisonService"
import { MAX_COMPARE_ITEMS } from "./types"

describe("comparisonService", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("loadCompareIds returns [] when storage is empty", () => {
    expect(loadCompareIds()).toEqual([])
  })

  it("saveCompareIds persists ids, loadCompareIds reads them", () => {
    saveCompareIds([1, 2, 3])
    expect(loadCompareIds()).toEqual([1, 2, 3])
  })

  it("saveCompareIds truncates to MAX_COMPARE_ITEMS", () => {
    const tooMany = Array.from({ length: MAX_COMPARE_ITEMS + 5 }, (_, i) => i + 1)
    saveCompareIds(tooMany)
    expect(loadCompareIds()).toHaveLength(MAX_COMPARE_ITEMS)
  })

  it("loadCompareIds returns [] for malformed JSON", () => {
    window.localStorage.setItem("compare:ids:v1", "{not-json}")
    expect(loadCompareIds()).toEqual([])
  })

  it("loadCompareIds filters out non-numeric values", () => {
    window.localStorage.setItem(
      "compare:ids:v1",
      JSON.stringify([1, "2", null, 3])
    )
    expect(loadCompareIds()).toEqual([1, 3])
  })

  it("addCompareId appends new id", () => {
    expect(addCompareId([1, 2], 3)).toEqual([1, 2, 3])
  })

  it("addCompareId is a no-op for duplicates", () => {
    expect(addCompareId([1, 2], 2)).toEqual([1, 2])
  })

  it("addCompareId is a no-op when full", () => {
    const full = [1, 2, 3, 4]
    expect(addCompareId(full, 5)).toEqual(full)
  })

  it("removeCompareId removes the id", () => {
    expect(removeCompareId([1, 2, 3], 2)).toEqual([1, 3])
  })

  it("removeCompareId is a no-op for unknown id", () => {
    expect(removeCompareId([1, 2, 3], 99)).toEqual([1, 2, 3])
  })

  it("isCompareFull returns true at MAX_COMPARE_ITEMS", () => {
    expect(isCompareFull([1, 2, 3, 4])).toBe(true)
  })

  it("isCompareFull returns false below MAX_COMPARE_ITEMS", () => {
    expect(isCompareFull([1, 2, 3])).toBe(false)
  })
})