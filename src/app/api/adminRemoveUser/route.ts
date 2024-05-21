import { z } from 'zod'
import {
  createAdminSupabaseClient,
  createAuthorizedAdminSupabaseClient,
} from '../supabase'
import { corsHeaders } from '../utils/cors'
import { getUserChatId, triggerQueueEvent } from '../../queue-utils/functions'
import { QueueEventResponse } from '../../queue-utils/types'
import { assertNotUndefined } from '../../queue-utils/utils/assertNotUndefined'
import retrieveChatChannelName from '../../queue-utils/utils/createChatChannelName'
import { serverClient } from '../../queue-utils/utils/getstream'

export { OPTIONS } from '../utils/cors'

const userToInteractWithSchema = z.object({
  name: z.string(),
  userProfileId: z.number(),
})

const adminQueueActionSchema = z.object({
  eventName: z.string(),
  data: z.object({
    companyId: z.number(),
    socketId: z.string(),
    userToInteractWith: userToInteractWithSchema,
    adminChannelName: z.string(),
    queueChannelName: z.string(),
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

    const adminChannelName = queueAction.data.adminChannelName

    const queueChannelName = queueAction.data.queueChannelName

    const userWhoInitiatedsSocketId = queueAction.data.socketId

    const { data: userToInteractWith, error: userToInteractWithError } =
      await adminSupabaseClient
        .from('user_profile')
        .select(
          'user_profile_id,is_otp_verified, queuedetails(realtime_channel_name)',
        )
        .eq('user_profile_id', userProfileId)
        .single()

    console.log({ userToInteractWith, userToInteractWithError })

    if (userToInteractWithError) throw userToInteractWithError

    const userIsPhoneNumberVerified = userToInteractWith.is_otp_verified
    const userToInteractWithRealtimeChannelName =
      userToInteractWith.queuedetails[0].realtime_channel_name!

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

      triggerQueueEvent(
        userToInteractWithRealtimeChannelName,
        'leave-queue',
        toSend,
      )
    }

    const alertOtherUsersOfSuccessfulLeave = async () => {
      const toSend = {
        actionType: 'leave-queue',
        companyId: companyId,
        status: 'success',
      } satisfies QueueEventResponse

      // Passing in socketId excludes the singular client who we notify through alertClientOfSuccesfulLeave

      // Doesn't sound right, I think this just excludes the restaurant lol

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

      triggerQueueEvent(adminChannelName, 'leave-queue', toSend)
    }

    await removeUserFromQueue()
    // await alertUserOfSuccessfulLeave()
    await alertOtherUsersOfSuccessfulLeave()
    await alertRestaurantOfSuccessfulLeave()

    return Response.json({ result: `ok` }, { headers: corsHeaders })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
