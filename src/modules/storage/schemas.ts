import { z } from "zod"
import {
  FOLDER_NAME_MAX,
  STORAGE_PACKAGE_TYPES,
  TEXT_FILE_CONTENT_MAX,
} from "./types"

export const storagePackageTypeSchema = z.enum(STORAGE_PACKAGE_TYPES)

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(FOLDER_NAME_MAX, "Name is too long"),
  parent_id: z.number().int().positive().nullable().optional(),
})

export type CreateFolderValues = z.input<typeof createFolderSchema>

export const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(FOLDER_NAME_MAX, "Name is too long"),
})

export type RenameFolderValues = z.input<typeof renameFolderSchema>

export const moveFolderSchema = z.object({
  parent_id: z.number().int().positive().nullable(),
})

export type MoveFolderValues = z.input<typeof moveFolderSchema>

export const createTextFileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  content: z
    .string()
    .max(TEXT_FILE_CONTENT_MAX, "Content is too long"),
  folder_id: z.number().int().positive().nullable().optional(),
})

export type CreateTextFileValues = z.input<typeof createTextFileSchema>

export const updateTextFileSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .optional(),
  content: z
    .string()
    .max(TEXT_FILE_CONTENT_MAX)
    .optional(),
})

export type UpdateTextFileValues = z.input<typeof updateTextFileSchema>

export const moveFileSchema = z.object({
  folder_id: z.number().int().positive().nullable(),
})

export type MoveFileValues = z.input<typeof moveFileSchema>

export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
})

export type RenameFileValues = z.input<typeof renameFileSchema>

export const upgradeStorageSchema = z.object({
  package_type: storagePackageTypeSchema,
})

export type UpgradeStorageValues = z.input<typeof upgradeStorageSchema>
