"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  addCompareId,
  loadCompareIds,
  removeCompareId,
  saveCompareIds,
} from "./comparisonService"
import { MAX_COMPARE_ITEMS } from "./types"

export interface CompareState {
  ids: number[]
  count: number
  maxItems: number
  isHydrated: boolean
  contains: (id: number) => boolean
  canAdd: boolean
  add: (id: number) => boolean
  remove: (id: number) => void
  toggle: (id: number) => boolean
  clear: () => void
}

const CompareContext = createContext<CompareState | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => loadCompareIds().slice(0, MAX_COMPARE_ITEMS))
  const [isHydrated, setHydrated] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (isHydrated) saveCompareIds(ids)
  }, [ids, isHydrated])

  const contains = useCallback(
    (id: number) => ids.includes(id),
    [ids]
  )

  const canAdd = ids.length < MAX_COMPARE_ITEMS

  const add = useCallback((id: number) => {
    let added = false
    setIds((prev) => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX_COMPARE_ITEMS) return prev
      added = true
      return addCompareId(prev, id)
    })
    return added
  }, [])

  const remove = useCallback((id: number) => {
    setIds((prev) => removeCompareId(prev, id))
  }, [])

  const toggle = useCallback((id: number) => {
    let nowSelected = false
    setIds((prev) => {
      if (prev.includes(id)) {
        return removeCompareId(prev, id)
      }
      if (prev.length >= MAX_COMPARE_ITEMS) return prev
      nowSelected = true
      return addCompareId(prev, id)
    })
    return nowSelected
  }, [])

  const clear = useCallback(() => {
    setIds([])
  }, [])

  const value = useMemo<CompareState>(
    () => ({
      ids,
      count: ids.length,
      maxItems: MAX_COMPARE_ITEMS,
      isHydrated,
      contains,
      canAdd,
      add,
      remove,
      toggle,
      clear,
    }),
    [ids, isHydrated, contains, canAdd, add, remove, toggle, clear]
  )

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  )
}

export function useCompare(): CompareState {
  const ctx = useContext(CompareContext)
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider")
  }
  return ctx
}

export function useCompareHydrated() {
  return useCompare().isHydrated
}

export { MAX_COMPARE_ITEMS }