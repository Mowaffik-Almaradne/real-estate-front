import { MAX_COMPARE_ITEMS } from "./types"

const STORAGE_KEY = "compare:ids:v1"

function readStorage(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is number => typeof v === "number")
  } catch {
    return []
  }
}

function writeStorage(ids: number[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota / serialization errors */
  }
}

/**
 * Returns the persisted comparison IDs (ordered by insertion).
 */
export function loadCompareIds(): number[] {
  return readStorage()
}

/**
 * Persists the comparison IDs (ordered by insertion).
 */
export function saveCompareIds(ids: number[]): void {
  writeStorage(ids.slice(0, MAX_COMPARE_ITEMS))
}

/**
 * Returns a new array with the id added (no-op if full or already present).
 */
export function addCompareId(ids: number[], id: number): number[] {
  if (ids.includes(id)) return ids
  if (ids.length >= MAX_COMPARE_ITEMS) return ids
  return [...ids, id]
}

/**
 * Returns a new array with the id removed.
 */
export function removeCompareId(ids: number[], id: number): number[] {
  return ids.filter((existing) => existing !== id)
}

/**
 * Returns whether `ids` has reached the maximum allowed items.
 */
export function isCompareFull(ids: number[]): boolean {
  return ids.length >= MAX_COMPARE_ITEMS
}