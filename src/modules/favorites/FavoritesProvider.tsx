"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export interface FavoritesState {
  ids: Set<number>
  count: number
  isHydrated: boolean
  isFavorite: (id: number) => boolean
  add: (id: number) => void
  remove: (id: number) => void
  toggle: (id: number) => boolean
  hydrate: (entries: { id: number; count?: number }[]) => void
  reset: () => void
}

const FavoritesContext = createContext<FavoritesState | null>(null)

const STORAGE_KEY = "favorites:ids:v1"

function readStorage(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : []
  } catch {
    return []
  }
}

function writeStorage(ids: Set<number>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    void 0
  }
}

export function FavoritesProvider({
  children,
  initialIds = [],
}: {
  children: ReactNode
  initialIds?: number[]
}) {
  // Start with the same seed on server + first client paint to avoid hydration mismatches.
  const [ids, setIds] = useState<Set<number>>(() => new Set(initialIds))
  const [isHydrated, setIsHydrated] = useState(false)
  const idsRef = useRef<Set<number>>(ids)

  useEffect(() => {
    idsRef.current = ids
  }, [ids])

  useEffect(() => {
    const stored = readStorage()
    Promise.resolve().then(() => {
      if (stored.length > 0) {
        setIds(new Set(stored))
      }
      setIsHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    writeStorage(ids)
  }, [ids, isHydrated])

  const add = useCallback((id: number) => {
    setIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const remove = useCallback((id: number) => {
    setIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: number) => {
    const wasFavorite = idsRef.current.has(id)
    if (wasFavorite) {
      idsRef.current.delete(id)
    } else {
      idsRef.current.add(id)
    }
    setIds(new Set(idsRef.current))
    return !wasFavorite
  }, [])

  const hydrate = useCallback(
    (entries: { id: number; count?: number }[]) => {
      setIds(new Set(entries.map((e) => e.id)))
    },
    []
  )

  const reset = useCallback(() => {
    setIds(new Set())
  }, [])

  const isFavorite = useCallback((id: number) => idsRef.current.has(id), [])

  const value = useMemo<FavoritesState>(
    () => ({
      ids,
      count: ids.size,
      isHydrated,
      isFavorite,
      add,
      remove,
      toggle,
      hydrate,
      reset,
    }),
    [ids, isHydrated, isFavorite, add, remove, toggle, hydrate, reset]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return ctx
}
