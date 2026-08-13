import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  folderService,
  fileService,
  storageService,
} from "./storageService"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  ApiClientError: class extends Error {},
}))

function makeFolder(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "General",
    user_id: 7,
    parent_id: null,
    is_protected: true,
    is_system: true,
    property_id: null,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

function makeFile(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "notes.txt",
    type: "text",
    mime_type: "text/plain",
    size: 120,
    size_readable: "120 B",
    folder_id: 1,
    user_id: 7,
    content: "Hello",
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("storageService – folder HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("GETs /folders with parent_id='' (root) when no filters are given", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await folderService.list()
      expect(mockGet).toHaveBeenCalledWith("/folders", {
        params: { parent_id: "" },
        silent: true,
      })
    })

    it("serializes parent_id into the request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await folderService.list({ parent_id: 5 })
      const args = mockGet.mock.calls[0]
      const params = args[1]?.params as Record<string, string>
      expect(params.parent_id).toBe("5")
    })

    it("returns the unwrapped data array", async () => {
      const folders = [makeFolder()]
      mockGet.mockResolvedValueOnce({ data: { data: folders } })
      const result = await folderService.list()
      expect(result).toEqual(folders)
    })

    it("returns an empty array when the data field is not an array", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      const result = await folderService.list()
      expect(result).toEqual([])
    })
  })

  describe("contents", () => {
    it("GETs /folders/{id} and unwraps the data envelope", async () => {
      const contents = {
        folder: makeFolder(),
        children: [],
        files: [],
        breadcrumbs: [],
        storage: { quota_bytes: 100 },
      }
      mockGet.mockResolvedValueOnce({ data: { data: contents } })
      const result = await folderService.contents(1)
      expect(mockGet).toHaveBeenCalledWith("/folders/1", { silent: true })
      expect(result).toEqual(contents)
    })
  })

  describe("create", () => {
    it("POSTs the folder payload to /folders", async () => {
      const folder = makeFolder()
      const payload = { name: "General", parent_id: null }
      mockPost.mockResolvedValueOnce({ data: { data: folder } })
      const result = await folderService.create(payload)
      expect(mockPost).toHaveBeenCalledWith("/folders", payload)
      expect(result).toEqual(folder)
    })
  })

  describe("rename", () => {
    it("POSTs to /folders/{id}/rename with the new name", async () => {
      const response = { folder: makeFolder({ name: "Updated" }) }
      mockPost.mockResolvedValueOnce({ data: { data: response } })
      const result = await folderService.rename(3, { name: "Updated" })
      expect(mockPost).toHaveBeenCalledWith("/folders/3/rename", {
        name: "Updated",
      })
      expect(result).toEqual(response)
    })
  })

  describe("renameViaPut", () => {
    it("PUTs to /folders/{id} with the new name", async () => {
      const folder = makeFolder({ name: "Updated via PUT" })
      mockPut.mockResolvedValueOnce({ data: { data: folder } })
      const result = await folderService.renameViaPut(4, { name: "Updated via PUT" })
      expect(mockPut).toHaveBeenCalledWith("/folders/4", { name: "Updated via PUT" })
      expect(result).toEqual(folder)
    })
  })

  describe("move", () => {
    it("POSTs to /folders/{id}/move with the parent_id", async () => {
      const folder = makeFolder({ parent_id: 5 })
      mockPost.mockResolvedValueOnce({ data: { data: folder } })
      const result = await folderService.move(2, { parent_id: 5 })
      expect(mockPost).toHaveBeenCalledWith("/folders/2/move", { parent_id: 5 })
      expect(result).toEqual(folder)
    })

    it("allows parent_id to be null (root)", async () => {
      const folder = makeFolder({ parent_id: null })
      mockPost.mockResolvedValueOnce({ data: { data: folder } })
      const result = await folderService.move(2, { parent_id: null })
      expect(mockPost).toHaveBeenCalledWith("/folders/2/move", { parent_id: null })
      expect(result).toEqual(folder)
    })
  })

  describe("remove", () => {
    it("DELETEs /folders/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await folderService.remove(8)
      expect(mockDelete).toHaveBeenCalledWith("/folders/8")
    })
  })
})

describe("storageService – file HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createText", () => {
    it("POSTs to /files/text", async () => {
      const file = makeFile()
      const payload = { name: "notes.txt", content: "Hello", folder_id: 1 }
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.createText(payload)
      expect(mockPost).toHaveBeenCalledWith("/files/text", payload)
      expect(result).toEqual(file)
    })
  })

  describe("uploadImage", () => {
    it("POSTs a multipart form to /files/image with the file and folder_id", async () => {
      const file = makeFile({ type: "image", name: "photo.jpg" })
      const fakeFile = new File(["binary"], "photo.jpg", { type: "image/jpeg" })
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.uploadImage(fakeFile, 1)
      const args = mockPost.mock.calls[0]
      expect(args[0]).toBe("/files/image")
      expect(args[2]).toEqual({ headers: { "Content-Type": "multipart/form-data" } })
      expect(args[1]).toBeInstanceOf(FormData)
      const form = args[1] as FormData
      expect(form.get("file")).toBeInstanceOf(File)
      expect(form.get("folder_id")).toBe("1")
      expect(result).toEqual(file)
    })

    it("omits folder_id when none is provided", async () => {
      const file = makeFile()
      const fakeFile = new File(["binary"], "photo.jpg", { type: "image/jpeg" })
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      await fileService.uploadImage(fakeFile)
      const form = mockPost.mock.calls[0][1] as FormData
      expect(form.get("folder_id")).toBeNull()
    })
  })

  describe("updateText", () => {
    it("PUTs to /files/{id}/text", async () => {
      const file = makeFile({ content: "Updated" })
      mockPut.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.updateText(3, { content: "Updated" })
      expect(mockPut).toHaveBeenCalledWith("/files/3/text", { content: "Updated" })
      expect(result).toEqual(file)
    })
  })

  describe("rename", () => {
    it("POSTs to /files/{id}/rename with the new name", async () => {
      const file = makeFile({ name: "renamed.txt" })
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.rename(7, { name: "renamed.txt" })
      expect(mockPost).toHaveBeenCalledWith("/files/7/rename", {
        name: "renamed.txt",
      })
      expect(result).toEqual(file)
    })
  })

  describe("move", () => {
    it("POSTs to /files/{id}/move with the folder_id", async () => {
      const file = makeFile({ folder_id: 9 })
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.move(4, { folder_id: 9 })
      expect(mockPost).toHaveBeenCalledWith("/files/4/move", { folder_id: 9 })
      expect(result).toEqual(file)
    })

    it("allows folder_id to be null (move to root)", async () => {
      const file = makeFile({ folder_id: null })
      mockPost.mockResolvedValueOnce({ data: { data: file } })
      const result = await fileService.move(4, { folder_id: null })
      expect(mockPost).toHaveBeenCalledWith("/files/4/move", { folder_id: null })
      expect(result).toEqual(file)
    })
  })

  describe("remove", () => {
    it("DELETEs /files/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await fileService.remove(8)
      expect(mockDelete).toHaveBeenCalledWith("/files/8")
    })
  })
})

describe("storageService – storage HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("status", () => {
    it("GETs /storage/status", async () => {
      const status = {
        quota_bytes: 100,
        quota_readable: "100 B",
        used_bytes: 1,
        used_readable: "1 B",
        remaining_bytes: 99,
        used_percentage: 1,
        package_type: "free",
        is_exceeded: false,
        is_near_limit: false,
        can_upload: true,
        available_packages: [],
      }
      mockGet.mockResolvedValueOnce({ data: { data: status } })
      const result = await storageService.status()
      expect(mockGet).toHaveBeenCalledWith("/storage/status", { silent: true })
      expect(result).toEqual(status)
    })
  })

  describe("packages", () => {
    it("GETs /storage/packages and returns the array", async () => {
      const packages = [
        {
          type: "free",
          name: "Free",
          quota_bytes: 100,
          quota_readable: "100 B",
          is_current: true,
        },
      ]
      mockGet.mockResolvedValueOnce({ data: { data: packages } })
      const result = await storageService.packages()
      expect(mockGet).toHaveBeenCalledWith("/storage/packages", { silent: true })
      expect(result).toEqual(packages)
    })

    it("returns an empty array when the data field is not an array", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      const result = await storageService.packages()
      expect(result).toEqual([])
    })
  })

  describe("upgrade", () => {
    it("POSTs to /storage/upgrade with the package_type", async () => {
      const status = { package_type: "medium" }
      mockPost.mockResolvedValueOnce({ data: { data: status } })
      const result = await storageService.upgrade({ package_type: "medium" })
      expect(mockPost).toHaveBeenCalledWith("/storage/upgrade", {
        package_type: "medium",
      })
      expect(result).toEqual(status)
    })
  })
})
