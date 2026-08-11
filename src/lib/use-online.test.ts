import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, renderHook } from "@testing-library/react"

import { useInstallPrompt, useOnlineStatus } from "./use-online"

describe("useOnlineStatus", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns true initially when navigator is online", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it("returns false when navigator is offline", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it("updates when the window fires an offline event", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event("online"))
    })
    expect(result.current).toBe(true)
  })

  it("removes listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useOnlineStatus())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function))
  })
})

describe("useInstallPrompt", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns canInstall=false when no beforeinstallprompt event has fired", () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)
  })

  it("captures the beforeinstallprompt event and exposes canInstall=true", () => {
    const { result } = renderHook(() => useInstallPrompt())
    const prompt = vi.fn().mockResolvedValue(undefined)
    const userChoice = vi.fn().mockResolvedValue({ outcome: "accepted", platform: "web" })
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>
      userChoice: () => Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
      platforms: string[]
    }
    event.prompt = prompt
    event.userChoice = userChoice
    event.platforms = ["web"]

    act(() => {
      window.dispatchEvent(event)
    })

    expect(result.current.canInstall).toBe(true)
  })

  it("promptInstall returns true when user accepts", async () => {
    const { result } = renderHook(() => useInstallPrompt())
    const prompt = vi.fn().mockResolvedValue(undefined)
    const userChoicePromise = Promise.resolve({ outcome: "accepted" as const, platform: "web" })
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
    }
    event.prompt = prompt
    event.userChoice = userChoicePromise

    act(() => {
      window.dispatchEvent(event)
    })
    expect(result.current.canInstall).toBe(true)

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.promptInstall()
    })
    expect(prompt).toHaveBeenCalled()
    expect(accepted).toBe(true)
  })

  it("appinstalled event clears the prompt", () => {
    const { result } = renderHook(() => useInstallPrompt())
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>
      userChoice: () => Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
    }
    event.prompt = prompt
    event.userChoice = vi.fn()

    act(() => {
      window.dispatchEvent(event)
    })
    expect(result.current.canInstall).toBe(true)

    act(() => {
      window.dispatchEvent(new Event("appinstalled"))
    })
    expect(result.current.canInstall).toBe(false)
  })
})