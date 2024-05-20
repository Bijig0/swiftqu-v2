import { getUserChatId, triggerQueueEvent } from '@/app/queue-utils/functions'
import { QueueEventResponse } from '@/app/queue-utils/types'
import { assertNotUndefined } from '@/app/queue-utils/utils/assertNotUndefined'
import retrieveChatChannelName from '@/app/queue-utils/utils/createChatChannelName'
import createQueueChannelName from '@/app/queue-utils/utils/createQueueChannelName'
import getOrCreateAdminChannelName from '@/app/queue-utils/utils/getOrCreateAdminChannelName'
import getOrCreateUserChannelName from '@/app/queue-utils/utils/getOrCreateUserChannelName'
import { serverClient } from '@/utils/getstream'
import { z } from 'zod'
import {
  createAdminSupabaseClient,
  createAuthorizedAdminSupabaseClient,
} from '../supabase'
import { corsHeaders } from '../utils/cors'

export { OPTIONS } from '../utils/cors'

const userToInteractWithSchema = z.object({
  name: z.string(),
  userProfileId: z.number(),
})

const adminQueueActionSchema = z.object({
  eventName: z.string(),
  data: z.object({
    // adminRealtimeChannelName: z.string(),
    companyId: z.number(),
    socketId: z.string(),
    userToInteractWith: userToInteractWithSchema,
  }),
})

type UserToInteractWith = {
  chatId: string | null
  name: string | null
  phoneNumber: string | null
  id: string
  userProfileId: number
  isOtpVerified: boolean
}

export async function POST(request: Request, params: unknown) {
  try {
    const authKey = request.headers.get('authorization')

    if (!authKey) throw new Error('No auth header')

    const supabaseClient = createAuthorizedAdminSupabaseClient(authKey)

    const adminSupabaseClient = createAdminSupabaseClient()

    const body = await request.json()

    const queueAction = adminQueueActionSchema.parse(body)

    console.log({ queueAction })

    const companyId = queueAction.data.companyId

    const { name, userProfileId } = queueAction.data.userToInteractWith

    const userWhoInitiatedsSocketId = queueAction.data.socketId

    const { data: userToInteractWith, error: userToInteractWithError } =
      await adminSupabaseClient
        .from('user_profile')
        .select('user_profile_id,is_otp_verified')
        .eq('user_profile_id', userProfileId)
        .single()

    if (userToInteractWithError) throw userToInteractWithError

    const userIsPhoneNumberVerified = userToInteractWith.is_otp_verified

    if (userIsPhoneNumberVerified) {
      //   assertNotUndefined(userToInteractWith.chatId)

      const removeUserFromChatChannel = async () => {
        const userChatId = await getUserChatId(
          supabaseClient,
          userToInteractWith,
        )
        assertNotUndefined(userChatId)
        const chatChannelName = retrieveChatChannelName(userChatId, companyId)
        const channel = serverClient.channel('messaging', chatChannelName)
        await channel.update({ disabled: true })
      }

      //   await removeUserFromChatChannel()
    }

    const removeUserFromQueue = async () => {
      const { error } = await supabaseClient
        .from('queuedetails')
        .delete()
        .match({
          queue_id: companyId,
          user_profile_id: userProfileId,
        })
      if (error) throw error
    }

    const alertUserOfSuccessfulLeave = async () => {
      const toSend = {
        actionType: 'leave-queue',
        companyId: companyId,
        status: 'success',
      } satisfies QueueEventResponse

      const userChannelName = getOrCreateUserChannelName(
        companyId,
        userToInteractWith.id,
      )

      triggerQueueEvent(userChannelName, 'leave-queue', toSend)
    }

    const alertOtherUsersOfSuccessfulLeave = async () => {
      const toSend = {
        actionType: 'leave-queue',
        companyId: companyId,
        status: 'success',
      } satisfies QueueEventResponse

      const queueChannelName = createQueueChannelName(companyId)

      // Passing in socketId excludes the singular client who we notify through alertClientOfSuccesfulLeave

      triggerQueueEvent(queueChannelName, 'leave-queue', toSend, {
        socket_id: userWhoInitiatedsSocketId,
      })
    }

    const alertRestaurantOfSuccessfulLeave = async () => {
      const toSend = {
        actionType: 'leave-queue',
        companyId: companyId,
        status: 'success',
      } satisfies QueueEventResponse

      const adminChannelName = getOrCreateAdminChannelName(companyId)

      triggerQueueEvent(adminChannelName, 'leave-queue', toSend)
    }

    await removeUserFromQueue()
    // await alertUserOfSuccessfulLeave()
    // await alertOtherUsersOfSuccessfulLeave()
    await alertRestaurantOfSuccessfulLeave()

    return Response.json({ result: `ok` }, { headers: corsHeaders })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
