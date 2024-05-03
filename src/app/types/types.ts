import { z } from 'zod'

export const restaurantDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  image_url: z.string(),
  queue_length: z.number(),
  estimated_wait_time: z.number(),
  pusherQueueChannelName: z.string(),
  pusherIndividualQueueChannelName: z.string(),
  queueDetailsURL: z.string(),
})

export const actionType = ['join-queue', 'seat-user', 'leave-queue'] as const

export const queueActionSchema = z.object({
  eventName: z.enum(actionType),
  data: z.object({
    companyId: z.number(),
    socketId: z.string(),
  }),
})

declare global {
  type RestaurantDetails = z.infer<typeof restaurantDetailsSchema>
  type Restaurants = RestaurantDetails[]
  type ActionType = (typeof actionType)[number]
  type QueueActionSchema = z.infer<typeof queueActionSchema>
}

declare global {
  type LocalAttachmentType = {
    file_size?: number
    mime_type?: string
  }
  type LocalChannelType = Record<string, unknown>
  type LocalCommandType = string
  type LocalEventType = Record<string, unknown>
  type LocalMessageType = Record<string, unknown>
  type LocalReactionType = Record<string, unknown>
  type LocalUserType = {
    image?: string
  }
  type StreamChatGenerics = {
    attachmentType: LocalAttachmentType
    channelType: LocalChannelType
    commandType: LocalCommandType
    eventType: LocalEventType
    messageType: LocalMessageType
    reactionType: LocalReactionType
    userType: LocalUserType
  }
}

export type SecureStoreKeys = {
  accessToken: string
  refreshToken: string
  chatToken: string
}

// export { Font };
