import { describe, it, expect, vi, beforeEach } from "vitest"
import { mediaService } from "./mediaService"

const mockPost = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
}))

function makeFile(name: string, content: string = "x"): File {
  return new File([content], name, { type: "text/plain" })
}

function makeTemporaryFile(overrides: Record<string, unknown> = {}) {
  return {
    id: "tmp_1",
    url: "https://example.com/tmp/1",
    filename: "photo.jpg",
    mime_type: "image/jpeg",
    size: 1024,
    ...overrides,
  }
}

function readFormData(form: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {}
  for (const [key, value] of form.entries()) {
    if (key in out) {
      const existing = out[key]
      out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      out[key] = value
    }
  }
  return out
}

describe("mediaService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("uploadOne", () => {
    it("POSTs FormData with type and file to /upload and sets multipart header", async () => {
      const file = makeFile("photo.jpg")
      const tmp = makeTemporaryFile()
      mockPost.mockResolvedValueOnce({ data: { data: tmp } })

      const result = await mediaService.uploadOne({ type: "property", file })

      expect(mockPost).toHaveBeenCalledTimes(1)
      const [url, form, config] = mockPost.mock.calls[0] as [string, FormData, Record<string, unknown>]
      expect(url).toBe("/upload")
      expect(form).toBeInstanceOf(FormData)
      const fields = readFormData(form)
      expect(fields.type).toBe("property")
      expect(fields.file).toBe(file)
      expect(config.headers).toEqual({ "Content-Type": "multipart/form-data" })
      expect(result).toEqual(tmp)
    })

    it("forwards the AbortSignal through to the request config", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: makeTemporaryFile() } })
      const controller = new AbortController()
      await mediaService.uploadOne({ type: "avatar", file: makeFile("a.png"), signal: controller.signal })
      const config = mockPost.mock.calls[0][2] as Record<string, unknown>
      expect(config.signal).toBe(controller.signal)
    })

    it("omits onUploadProgress when no onProgress callback is provided", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: makeTemporaryFile() } })
      await mediaService.uploadOne({ type: "property", file: makeFile("a.jpg") })
      const config = mockPost.mock.calls[0][2] as Record<string, unknown>
      expect(config.onUploadProgress).toBeUndefined()
    })

    it("wraps onProgress in a handler that converts loaded/total to a percent", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: makeTemporaryFile() } })
      const onProgress = vi.fn()
      await mediaService.uploadOne({ type: "property", file: makeFile("a.jpg"), onProgress })
      const config = mockPost.mock.calls[0][2] as Record<string, unknown>
      const handler = config.onUploadProgress as (event: { loaded: number; total?: number }) => void

      handler({ loaded: 0, total: 0 })
      expect(onProgress).not.toHaveBeenCalled()

      handler({ loaded: 0, total: 200 })
      expect(onProgress).toHaveBeenLastCalledWith(0)

      handler({ loaded: 50, total: 200 })
      expect(onProgress).toHaveBeenLastCalledWith(25)

      handler({ loaded: 200, total: 200 })
      expect(onProgress).toHaveBeenLastCalledWith(100)
    })
  })

  describe("uploadMany", () => {
    it("POSTs FormData with type and files[] to /upload", async () => {
      const files = [makeFile("a.jpg"), makeFile("b.jpg"), makeFile("c.jpg")]
      const tmp = [makeTemporaryFile({ filename: "a.jpg" })]
      mockPost.mockResolvedValueOnce({ data: { data: tmp } })

      const result = await mediaService.uploadMany({ type: "property", files })

      const [url, form, config] = mockPost.mock.calls[0] as [string, FormData, Record<string, unknown>]
      expect(url).toBe("/upload")
      expect(form).toBeInstanceOf(FormData)
      const fields = readFormData(form)
      expect(fields.type).toBe("property")
      expect(fields["files[]"]).toHaveLength(3)
      expect((fields["files[]"] as FormDataEntryValue[])[0]).toBe(files[0])
      expect((fields["files[]"] as FormDataEntryValue[])[1]).toBe(files[1])
      expect((fields["files[]"] as FormDataEntryValue[])[2]).toBe(files[2])
      expect(config.headers).toEqual({ "Content-Type": "multipart/form-data" })
      expect(result).toEqual(tmp)
    })

    it("forwards the AbortSignal and progress callback to the request config", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: [makeTemporaryFile()] } })
      const controller = new AbortController()
      const onProgress = vi.fn()
      await mediaService.uploadMany({
        type: "property",
        files: [makeFile("a.jpg")],
        signal: controller.signal,
        onProgress,
      })
      const config = mockPost.mock.calls[0][2] as Record<string, unknown>
      expect(config.signal).toBe(controller.signal)
      expect(typeof config.onUploadProgress).toBe("function")
    })
  })
})
