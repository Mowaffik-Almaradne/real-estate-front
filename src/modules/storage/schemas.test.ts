import { describe, it, expect } from "vitest"
import {
  createFolderSchema,
  createTextFileSchema,
  moveFolderSchema,
  moveFileSchema,
  renameFolderSchema,
  renameFileSchema,
  storagePackageTypeSchema,
  updateTextFileSchema,
  upgradeStorageSchema,
} from "./schemas"

describe("storage schemas", () => {
  it("rejects folder without name", () => {
    const result = createFolderSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("accepts a minimal folder with parent_id", () => {
    const result = createFolderSchema.safeParse({
      name: "General",
      parent_id: 1,
    })
    expect(result.success).toBe(true)
  })

  it("rejects folder name too long", () => {
    const result = createFolderSchema.safeParse({ name: "x".repeat(256) })
    expect(result.success).toBe(false)
  })

  it("accepts a rename payload", () => {
    const result = renameFolderSchema.safeParse({ name: "Updated" })
    expect(result.success).toBe(true)
  })

  it("rejects move without parent_id", () => {
    const result = moveFolderSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts move to root (null)", () => {
    const result = moveFolderSchema.safeParse({ parent_id: null })
    expect(result.success).toBe(true)
  })

  it("rejects text file without name", () => {
    const result = createTextFileSchema.safeParse({
      name: "",
      content: "Hello",
    })
    expect(result.success).toBe(false)
  })

  it("rejects text file content too long", () => {
    const result = createTextFileSchema.safeParse({
      name: "notes.txt",
      content: "x".repeat(5_001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts update text file with both fields", () => {
    const result = updateTextFileSchema.safeParse({
      name: "renamed.txt",
      content: "Updated",
    })
    expect(result.success).toBe(true)
  })

  it("accepts an empty update text file", () => {
    const result = updateTextFileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("requires folder_id for file move", () => {
    const result = moveFileSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts move file to root (null)", () => {
    const result = moveFileSchema.safeParse({ folder_id: null })
    expect(result.success).toBe(true)
  })

  it("rejects file rename without name", () => {
    const result = renameFileSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects unknown package type", () => {
    const result = storagePackageTypeSchema.safeParse("mega")
    expect(result.success).toBe(false)
  })

  it("accepts upgrade with package_type", () => {
    const result = upgradeStorageSchema.safeParse({ package_type: "medium" })
    expect(result.success).toBe(true)
  })
})
