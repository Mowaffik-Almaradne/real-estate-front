import { z } from "zod"

export const messageTypeEnum = z.enum(["text", "image", "file"])

export const chatRoomTypeEnum = z.enum(["private", "group", "property"])

export const sendMessageSchema = z
  .object({
    body: z
      .string()
      .min(1, "Message body is required")
      .max(5000, "Message body must not exceed 5000 characters"),
    type: messageTypeEnum,
    attachment_url: z.string().url().optional(),
  })
  .strict()

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const createRoomSchema = z
  .object({
    type: chatRoomTypeEnum,
    recipient_id: z.number().int().positive().optional(),
    property_id: z.number().int().positive().optional(),
  })
  .strict()

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const participantSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    avatar_url: z.string().optional(),
  })
  .strict()

export const lastMessageSchema = z
  .object({
    id: z.number(),
    body: z.string(),
    type: messageTypeEnum,
    sender_id: z.number(),
    created_at: z.string(),
  })
  .strict()

export const chatRoomResponseSchema = z
  .object({
    id: z.number(),
    name: z.string().nullable().optional(),
    type: chatRoomTypeEnum,
    property_id: z.number().optional(),
    participants: z.array(participantSchema),
    last_message: lastMessageSchema.optional(),
    unread_count: z.number(),
    created_at: z.string(),
    updated_at: z.string().optional(),
  })
  .strict()

export const messageResponseSchema = z
  .object({
    id: z.number(),
    room_id: z.number(),
    body: z.string(),
    type: messageTypeEnum,
    attachment_url: z.string().optional(),
    sender: participantSchema,
    created_at: z.string(),
  })
  .strict()
