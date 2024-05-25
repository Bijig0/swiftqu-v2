import { z } from 'zod'

export const userToInteractWithSchema = z.object({
  name: z.string(),
  userProfileId: z.number(),
})

export const adminQueueActionDataSchema = z.object({
  companyId: z.number(),
  socketId: z.string(),
  userToInteractWith: userToInteractWithSchema,
  adminChannelName: z.string(),
  queueChannelName: z.string(),
})

export const adminQueueActionSchema = z.object({
  eventName: z.string(),
  data: adminQueueActionDataSchema,
})

export type AdminQueueActionDataSchema = z.infer<
  typeof adminQueueActionDataSchema
>

export type UserToInteractWithSchema = z.infer<typeof userToInteractWithSchema>

export type AdminQueueActionSchema = z.infer<typeof adminQueueActionSchema>
