import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import { TypingIndicator } from "src/modules/chat/components/TypingIndicator"

const messages = {
  chat: {
    typing: {
      isTyping: "{name} is typing…",
      multipleTyping: "{count} people are typing…",
    },
  },
}

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}

describe("TypingIndicator", () => {
  it("renders nothing when no users", () => {
    const { container } = renderWithIntl(<TypingIndicator users={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("shows single user typing", () => {
    renderWithIntl(<TypingIndicator users={["Alice"]} />)
    expect(screen.getByText("Alice is typing…")).toBeInTheDocument()
  })

  it("shows multiple users typing", () => {
    renderWithIntl(<TypingIndicator users={["Alice", "Bob", "Charlie"]} />)
    expect(screen.getByText("3 people are typing…")).toBeInTheDocument()
  })
})