import "@testing-library/jest-dom/vitest"

/**
 * Node 25 exposes an incomplete experimental `localStorage` (no `clear()`).
 * jsdom then inherits that stub, which breaks tests that reset storage.
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
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
}

const memoryStorage = createMemoryStorage()

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: memoryStorage,
})

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    writable: true,
    value: memoryStorage,
  })
}
