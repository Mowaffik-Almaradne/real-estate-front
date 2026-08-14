import { describe, it, expect, vi, beforeAll } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"

import { AsyncSelect } from "./async-select"

class MockIntersectionObserver {
  private callback: IntersectionObserverCallback
  public readonly root: Element | null = null
  public readonly rootMargin = "0px"
  public readonly thresholds: ReadonlyArray<number> = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

beforeAll(() => {
  if (typeof globalThis.IntersectionObserver === "undefined") {
    Object.defineProperty(globalThis, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  }
})

interface Option {
  id: number
  name: string
}

function Harness({
  fetcher,
  initial,
}: {
  fetcher: Parameters<typeof AsyncSelect<Option>>[0]["fetcher"]
  initial?: Option | null
}) {
  const [value, setValue] = useState<Option | null>(initial ?? null)
  return (
    <AsyncSelect<Option>
      value={value}
      onChange={setValue}
      fetcher={fetcher}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      placeholder="Pick one"
      searchPlaceholder="Search…"
    />
  )
}

describe("AsyncSelect", () => {
  function getTrigger() {
    return screen.getByRole("button", { name: "Pick one" })
  }

  it("renders the trigger with the placeholder", () => {
    render(
      <Harness
        fetcher={async () => ({ items: [], hasMore: false })}
      />
    )
    expect(getTrigger()).toBeInTheDocument()
    expect(screen.getByText("Pick one")).toBeInTheDocument()
  })

  it("opens the dropdown and renders fetched options", async () => {
    const items: Option[] = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ]
    render(
      <Harness
        fetcher={async () => ({ items, hasMore: false })}
      />
    )

    fireEvent.click(getTrigger())

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Beta")).toBeInTheDocument()
  })

  it("calls the fetcher again when the user types", async () => {
    const fetcher = vi.fn(async ({ search }: { search: string; page: number }) => ({
      items: search ? [{ id: 99, name: `Match for ${search}` }] : [],
      hasMore: false,
    }))

    render(<Harness fetcher={fetcher} />)
    fireEvent.click(getTrigger())

    const input = await waitFor(() => screen.getByPlaceholderText("Search…"))
    fireEvent.change(input, { target: { value: "abc" } })

    // Debounce is 300ms inside the component; wait long enough for the
    // debounced effect to flush and re-invoke the fetcher.
    await waitFor(
      () => {
        const calls = fetcher.mock.calls
        expect(calls.some((args) => args[0]?.search === "abc")).toBe(true)
      },
      { timeout: 1500 }
    )
  })

  it("shows an error state with a retry button", async () => {
    render(
      <Harness
        fetcher={async () => {
          throw new Error("boom")
        }}
      />
    )

    fireEvent.click(getTrigger())

    await waitFor(() => {
      expect(screen.getByText("Failed to load options.")).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    render(
      <Harness
        fetcher={async () => ({ items: [{ id: 1, name: "Alpha" }], hasMore: false })}
      />
    )
    const trigger = getTrigger()
    fireEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument())
    fireEvent.keyDown(trigger, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
  })
})
