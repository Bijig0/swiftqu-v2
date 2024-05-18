import {
  addUserToQueue,
  alertRestaurantOfSuccessfulJoin,
  getUserChatId,
  triggerQueueEvent,
} from '@/app/queue-utils/functions'
import { QueueEventResponse } from '@/app/queue-utils/types'
import { assertNotUndefined } from '@/app/queue-utils/utils/assertNotUndefined'
import retrieveChatChannelName from '@/app/queue-utils/utils/createChatChannelName'
import createQueueChannelName from '@/app/queue-utils/utils/createQueueChannelName'
import getOrCreateAdminChannelName from '@/app/queue-utils/utils/getOrCreateAdminChannelName'
import getOrCreateUserChannelName from '@/app/queue-utils/utils/getOrCreateUserChannelName'
import { serverClient } from '@/utils/getstream'
import { objectToCamel, objectToSnake } from 'ts-case-convert'
import { z } from 'zod'
import { createAuthorizedAdminSupabaseClient } from '../supabase'
import { corsHeaders } from '../utils/cors'

export { OPTIONS } from '../utils/cors'

const userToInteractWithSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
})

const adminQueueActionSchema = z.object({
  eventName: z.string(),
  data: z.object({
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

    const body = await request.json()

    console.log({ body })

    const queueAction = adminQueueActionSchema.parse(body)

    const actionType = queueAction.eventName

    const companyId = queueAction.data.companyId

    const userWhoInitiatedsSocketId = queueAction.data.socketId

    const uncheckedUserToInteractWith = queueAction.data.userToInteractWith

    const createUnverifiedUser = async (): Promise<UserToInteractWith> => {
      let userId: string

      const {
        data: maybeAlreadyCreatedUnverifiedUser,
        error: maybeAlreadyCreatedUnverifiedUserError,
      } = await supabaseClient
        .from('user_profile')
        .select('user_id')
        .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)

      if (maybeAlreadyCreatedUnverifiedUserError)
        throw maybeAlreadyCreatedUnverifiedUserError

      if (maybeAlreadyCreatedUnverifiedUser.length !== 0) {
        userId = maybeAlreadyCreatedUnverifiedUser[0].user_id
      } else {
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.admin.createUser({
          phone: uncheckedUserToInteractWith.phoneNumber,
        })

        if (!user || error) throw error

        userId = user.id
      }

      const performUserShapeTransformation = async (
        userId: string,
      ): Promise<UserToInteractWith> => {
        const unverifiedUser = {
          name: uncheckedUserToInteractWith.name,
          phone_number: uncheckedUserToInteractWith.phoneNumber,
          is_restaurant_admin: false,
          chat_id: null,
          is_otp_verified: false,
          user_id: userId,
        }

        const {
          data: unverifiedUserProfile,
          error: createUnverifiedUserProfileError,
        } = await supabaseClient
          .from('user_profile')
          .upsert(unverifiedUser, { onConflict: 'user_id' })
          .select(
            'phone_number,name,is_otp_verified,chat_id,user_profile_id,user_id',
          )
          .single()

        if (!unverifiedUserProfile || createUnverifiedUserProfileError)
          throw createUnverifiedUserProfileError

        const toCamelCase = objectToCamel(unverifiedUserProfile)

        const withId = { ...toCamelCase, id: userId }

        const { userId: _, ...withoutUserId } = withId

        return withoutUserId
      }

      const unverifiedUser = await performUserShapeTransformation(userId)

      return unverifiedUser
    }

    const retrieveUser = async (): Promise<UserToInteractWith> => {
      const { data: userData, error: getUserIdError } = await supabaseClient
        .from('user_profile')
        .select('user_id,chat_id,is_otp_verified,user_profile_id')
        .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)
        .single()

      if (getUserIdError || userData === null) throw getUserIdError

      const userToInteractWith = {
        phoneNumber: uncheckedUserToInteractWith.phoneNumber,
        name: uncheckedUserToInteractWith.name,
        chatId: userData.chat_id,
        id: userData.user_id,
        isOtpVerified: userData.is_otp_verified,
        userProfileId: userData.user_profile_id,
      } satisfies UserToInteractWith

      return userToInteractWith
    }

    const checkUserToInteractWithExists = async (): Promise<boolean> => {
      const { data: user, error } = await supabaseClient
        .from('user_profile')
        .select('user_profile_id,is_otp_verified')
        .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)

      if (error) throw error

      const userExists = user.length !== 0

      return userExists
    }

    const userExists = await checkUserToInteractWithExists()

    const userToInteractWith = userExists
      ? await retrieveUser()
      : await createUnverifiedUser()

    userToInteractWith satisfies UserToInteractWith

    const userIsPhoneNumberVerified = userToInteractWith.isOtpVerified

    if (actionType === 'join-queue') {
      if (userIsPhoneNumberVerified) {
        const alertRestaurantOfFailedJoin = async () => {
          const toSend = {
            message:
              'User has verified their phone number, must join through the app',
            status: 'error',
          } satisfies QueueEventResponse

          const adminChannelName = getOrCreateAdminChannelName(companyId)

          triggerQueueEvent(adminChannelName, 'join-queue', toSend)
        }

        await alertRestaurantOfFailedJoin()
        res.status(404).json({ result: `ok` })
        return
      }

      const toSnakeCase = objectToSnake(userToInteractWith)

      await addUserToQueue(supabaseClient, companyId, toSnakeCase)

      await alertRestaurantOfSuccessfulJoin(companyId)

      res.status(200).json({ result: `ok` })

      return
    }

    if (actionType === 'leave-queue') {
      if (userIsPhoneNumberVerified) {
        assertNotUndefined(userToInteractWith.chatId)

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

        await removeUserFromChatChannel()
      }

      const removeUserFromQueue = async () => {
        const { error } = await supabaseClient
          .from('queuedetails')
          .delete()
          .match({
            queue_id: companyId,
            user_profile_id: userToInteractWith.userProfileId,
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
      await alertUserOfSuccessfulLeave()
      await alertOtherUsersOfSuccessfulLeave()
      await alertRestaurantOfSuccessfulLeave()

      res.status(200).json({ result: `ok` })
      return
    }

    if (actionType === 'seat-user') {
      if (userIsPhoneNumberVerified) {
        assertNotUndefined(userToInteractWith.chatId)

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

        // await removeUserFromChatChannel()
      }

      const removeUserFromQueue = async () => {
        const { error } = await supabaseClient
          .from('queuedetails')
          .delete()
          .eq('queue_id', companyId)
          .eq('user_profile_id', userToInteractWith.userProfileId)
        if (error) throw error
      }

      const alertUsersOfSuccessfulSeat = async () => {
        const toSend = {
          actionType: 'seat-user',
          companyId: companyId,
          status: 'success',
        } satisfies QueueEventResponse

        const userChannelName = getOrCreateUserChannelName(
          companyId,
          userToInteractWith.id,
        )

        triggerQueueEvent(userChannelName, 'seat-user', toSend, {
          socket_id: userWhoInitiatedsSocketId,
        })
      }

      const alertOtherUsersOfSuccessfulLeave = async () => {
        const toSend = {
          actionType: 'seat-user',
          companyId: companyId,
          status: 'success',
        } satisfies QueueEventResponse

        const queueChannelName = createQueueChannelName(companyId)

        // Passing in socketId excludes the singular client who we notify through alertClientOfSuccesfulLeave

        triggerQueueEvent(queueChannelName, 'seat-user', toSend, {
          socket_id: userWhoInitiatedsSocketId,
        })
      }

      await removeUserFromQueue()
      await alertUsersOfSuccessfulSeat()
      await alertOtherUsersOfSuccessfulLeave()

      return Response.json({ result: `ok` }, { headers: corsHeaders })
    }
    return Response.json({ result: `ok` }, { headers: corsHeaders })
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
