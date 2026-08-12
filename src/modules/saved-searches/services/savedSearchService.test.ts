import { describe, it, expect, beforeEach, vi } from "vitest"
import { savedSearchService } from "../services/savedSearchService"
import { EMPTY_SAVED_SEARCH_FILTERS } from "../types"

const STORAGE_KEY = "re:saved-searches:v1"

function installMemoryStorage() {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }
  vi.stubGlobal("localStorage", memoryStorage)
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: memoryStorage,
  })
}

describe("savedSearchService (localStorage)", () => {
  beforeEach(() => {
    installMemoryStorage()
  })

  describe("list", () => {
    it("returns empty array when nothing is stored", async () => {
      await expect(savedSearchService.list()).resolves.toEqual([])
    })

    it("returns stored searches", async () => {
      const created = await savedSearchService.create({
        name: "Villas",
        filters: { ...EMPTY_SAVED_SEARCH_FILTERS, search: "villa" },
      })
      const result = await savedSearchService.list()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: created.id, name: "Villas" })
    })
  })

  describe("create", () => {
    it("persists a new saved search", async () => {
      const result = await savedSearchService.create({
        name: "Houses",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
        alert_enabled: true,
        alert_frequency: "instant",
      })
      expect(result.id).toBeGreaterThan(0)
      expect(result.name).toBe("Houses")
      expect(result.alert_frequency).toBe("instant")
      const raw = window.localStorage.getItem(STORAGE_KEY)
      expect(raw).toContain("Houses")
    })
  })

  describe("update", () => {
    it("updates alert flags on an existing search", async () => {
      const created = await savedSearchService.create({
        name: "Apt",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
      })
      const updated = await savedSearchService.update(created.id, { alert_enabled: false })
      expect(updated.alert_enabled).toBe(false)
      const listed = await savedSearchService.list()
      expect(listed[0].alert_enabled).toBe(false)
    })
  })

  describe("remove", () => {
    it("deletes a saved search", async () => {
      const created = await savedSearchService.create({
        name: "Gone",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
      })
      await savedSearchService.remove(created.id)
      await expect(savedSearchService.list()).resolves.toEqual([])
    })
  })
})
