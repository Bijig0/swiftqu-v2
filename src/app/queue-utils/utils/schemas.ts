import { z } from 'zod'

export const userSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  isRestaurantAdmin: z.boolean(),
})

export const actionType = ['join-queue', 'seat-user', 'leave-queue'] as const

export const queueActionSchema = z.object({
  eventName: z.enum(actionType),
  data: z.object({
    socketId: z.string(),
    companyId: z.number(),
    user: z
      .object({
        phoneNumber: z.string(),
      })
      .optional(),
  }),
})

export type UserSchema = z.infer<typeof userSchema>
