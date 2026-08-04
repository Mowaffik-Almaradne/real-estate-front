import { describe, it, expect, vi } from "vitest"
import { useState } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { SocialLinksEditor, type SocialLinksMap } from "./SocialLinksEditor"

interface HarnessProps {
  initial?: SocialLinksMap
  onChange?: (next: SocialLinksMap) => void
}

function Harness({ initial = {}, onChange }: HarnessProps) {
  const [value, setValue] = useState<SocialLinksMap>(initial)
  const handle = (next: SocialLinksMap) => {
    setValue(next)
    onChange?.(next)
  }
  return <SocialLinksEditor value={value} onChange={handle} />
}

function renderEditor(initial: SocialLinksMap = {}, onChange?: (next: SocialLinksMap) => void) {
  const handle = vi.fn(onChange)
  const utils = render(<Harness initial={initial} onChange={handle} />)
  return { ...utils, handle }
}

describe("SocialLinksEditor", () => {
  it("shows the empty state when no links are configured", () => {
    renderEditor()
    expect(screen.getByText("No social links added yet.")).toBeInTheDocument()
  })

  it("renders a row for each existing entry", () => {
    renderEditor({ facebook: "https://facebook.com/x" })
    expect(screen.getByDisplayValue("https://facebook.com/x")).toBeInTheDocument()
  })

  it("adds a new entry when clicking Add social link", () => {
    const { handle } = renderEditor()
    fireEvent.click(screen.getByRole("button", { name: /add social link/i }))
    expect(handle).toHaveBeenCalled()
    const call = handle.mock.calls[0]?.[0] as SocialLinksMap
    expect(Object.keys(call)).toContain("facebook")
  })

  it("normalises URL by prepending https when missing", () => {
    const { handle, container } = renderEditor({ website: "old.example.com" })
    const urlInputs = container.querySelectorAll('input[type="url"]') as NodeListOf<HTMLInputElement>
    const urlInput = urlInputs[0]
    fireEvent.change(urlInput, { target: { value: "example.com" } })
    const last = handle.mock.calls.at(-1)?.[0] as SocialLinksMap
    expect(last.website).toBe("https://example.com")
  })

  it("removes a row when clicking the trash icon", () => {
    const { handle } = renderEditor({ facebook: "https://facebook.com/x" })
    const button = screen.getByRole("button", { name: /Remove Facebook/i })
    fireEvent.click(button)
    const last = handle.mock.calls.at(-1)?.[0] as SocialLinksMap
    expect(last.facebook).toBeUndefined()
  })
})
