import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

const mockUploadOne = vi.fn()
const mockPost = vi.fn()

vi.mock("src/modules/media", () => ({
  mediaService: {
    uploadOne: (...args: unknown[]) => mockUploadOne(...args),
  },
}))

vi.mock("@/lib/apiClient", () => ({
  ApiClientError: class extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = "ApiClientError"
    }
  },
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

import { AdMediaUpload, type AdMediaValue } from "./AdMediaUpload"

const messages = {
  ads: {
    form: {
      mediaLabel: "Media (optional)",
      mediaHelp: "JPG/PNG/WebP/MP4. Max 20MB.",
      mediaEmpty: "No media selected yet.",
      mediaUploading: "Uploading...",
      mediaUploaded: "Uploaded media",
      mediaRemove: "Remove media",
      addMedia: "Add media",
      mediaTypeImage: "Image",
      mediaTypeVideo: "Video",
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

function makeFile(name: string, sizeBytes: number, type: string): File {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

describe("AdMediaUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the empty state when no value is provided", () => {
    renderWithIntl(
      <AdMediaUpload value={null} onChange={() => undefined} />
    )
    expect(screen.getByText("No media selected yet.")).toBeInTheDocument()
  })

  it("renders an image preview for image mime types", () => {
    const value: AdMediaValue = {
      id: 42,
      url: "https://example.com/image.png",
      mime_type: "image/png",
      name: "image.png",
      size: 1024,
    }
    const { container } = renderWithIntl(
      <AdMediaUpload value={value} onChange={() => undefined} />
    )
    const img = container.querySelector("img")
    expect(img).not.toBeNull()
    expect(img?.getAttribute("src")).toBe("https://example.com/image.png")
    expect(container.textContent).toContain("Image")
  })

  it("renders a video placeholder for video mime types", () => {
    const value: AdMediaValue = {
      id: 7,
      url: "https://example.com/clip.mp4",
      mime_type: "video/mp4",
      name: "clip.mp4",
      size: 5_000_000,
    }
    const { container } = renderWithIntl(
      <AdMediaUpload value={value} onChange={() => undefined} />
    )
    expect(container.textContent).toContain("Video")
    expect(container.textContent).toContain("clip.mp4")
  })

  it("uploads a selected file via mediaService.uploadOne and emits the id", async () => {
    const onChange = vi.fn()
    const tmp = {
      id: 99,
      url: "https://example.com/uploaded.jpg",
      thumb_url: null,
      filename: "photo.jpg",
      mime_type: "image/jpeg",
      size: 2048,
    }
    mockUploadOne.mockResolvedValueOnce(tmp)

    const { container } = renderWithIntl(
      <AdMediaUpload value={null} onChange={onChange} />
    )

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile("photo.jpg", 1024, "image/jpeg")
    Object.defineProperty(input, "files", { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(mockUploadOne).toHaveBeenCalledTimes(1)
    })

    const args = mockUploadOne.mock.calls[0][0]
    expect(args.type).toBe("property")
    expect(args.file).toBe(file)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 99, name: "photo.jpg" })
      )
    })
  })

  it("clears the value when the remove button is pressed", () => {
    const onChange = vi.fn()
    const value: AdMediaValue = {
      id: 1,
      url: "https://example.com/x.png",
      mime_type: "image/png",
      name: "x.png",
      size: 100,
    }
    renderWithIntl(
      <AdMediaUpload value={value} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole("button", { name: "Remove media" }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
