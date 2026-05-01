import { z } from "zod"

export const notificationDtoSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    message: z.string(),
    data: z.record(z.string(), z.unknown()).nullable(),
    read_at: z.string().nullable(),
    created_at: z.string(),
  })
  .strict()

export type NotificationDtoInput = z.infer<typeof notificationDtoSchema>

export const notificationMetaSchema = z
  .object({
    current_page: z.number(),
    total: z.number(),
    per_page: z.number().optional(),
  })
  .strict()

export const notificationsResponseSchema = z
  .object({
    data: z.array(notificationDtoSchema),
    meta: notificationMetaSchema,
  })
  .strict()

export type NotificationsResponseInput = z.infer<
  typeof notificationsResponseSchema
>

export const unreadCountResponseSchema = z
  .object({
    unread_count: z.number(),
  })
  .strict()

export type UnreadCountResponseInput = z.infer<typeof unreadCountResponseSchema>