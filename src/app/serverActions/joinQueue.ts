'use server'

import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import {
  addUserToQueue,
  alertRestaurantOfSuccessfulJoin,
  getRestaurantAdmin,
  getUserChatId,
  triggerQueueEvent,
} from '../queue-utils/functions'
import { QueueEventResponse } from '../queue-utils/types'
import { assertNotUndefined } from '../queue-utils/utils/assertNotUndefined'
import retrieveChatChannelName from '../queue-utils/utils/createChatChannelName'
import getOrCreateUserChannelName from '../queue-utils/utils/getOrCreateUserChannelName'
import { serverClient } from '../queue-utils/utils/getstream'

const joinQueue = async (companyId: number, socketId: string) => {
  const toSend = {
    eventName: 'join-queue',
    data: {
      companyId: companyId,
      socketId: socketId,
    },
  } satisfies QueueActionSchema

  const cookiesStore = cookies()

  const supabaseClient = createServerClient(cookiesStore)

  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (!user) throw new Error('No user found')

  const { data: userProfile, error: userProfileError } = await supabaseClient
    .from('user_profile')
    .select('user_profile_id,chat_id,phone_number')
    .eq('user_id', user.id)
    .single()

  if (userProfileError || !userProfile) throw userProfileError

  const checkUserInQueue = async (): Promise<boolean> => {
    const { data: userQueueDetails, error } = await supabaseClient
      .from('queuedetails')
      .select('joined_at,queue_id,user_profile_id')
      .eq('queue_id', companyId)
      .eq('user_profile_id', userProfile.user_profile_id)
      .single()

    const userIsPresentInQueue = userQueueDetails !== null && error === null

    return userIsPresentInQueue
  }

  const enterUserIntoChatChannel = async () => {
    const userChatId = await getUserChatId(supabaseClient, user)

    assertNotUndefined(userChatId)

    const chatChannelName = retrieveChatChannelName(userChatId, companyId)
    const admin = await getRestaurantAdmin(supabaseClient, companyId)
    const adminChatId = admin.chat_id
    assertNotUndefined(adminChatId)

    console.log(`Initializing chat channel ${chatChannelName}`)
    const channel = serverClient.channel('messaging', chatChannelName, {
      created_by_id: adminChatId,
    })
    console.log(`Initialized chat channel ${chatChannelName}`)

    console.log(`Creating chat channel ${chatChannelName}`)
    await channel.create()
    await channel.update({ disabled: false })
    console.log(`Created chat channel ${chatChannelName}`)

    if (userProfile.chat_id === null || admin.chat_id === null)
      throw new Error('Chat id null')

    await channel.addMembers([userProfile.chat_id, admin.chat_id])
    await channel.sendMessage({
      text: `Welcome! Feel free to send us a message if you have any enquiries, happy queuing :)`,
      user_id: adminChatId,
    })
  }

  const alertUserOfSuccessfulJoin = async () => {
    const joinQueueResponse = {
      actionType: 'join-queue',
      companyId: companyId,
      status: 'success',
    } satisfies QueueEventResponse

    const userChannelName = getOrCreateUserChannelName(companyId, user.id)

    triggerQueueEvent(userChannelName, 'join-queue', joinQueueResponse)
  }

  const isUserInQueue = await checkUserInQueue()

  if (isUserInQueue) {
    await alertUserOfSuccessfulJoin()
    return
  }

  await addUserToQueue(supabaseClient, companyId, userProfile)
  await enterUserIntoChatChannel()

  await alertUserOfSuccessfulJoin()
  await alertRestaurantOfSuccessfulJoin(companyId)

  return toSend
}

export default joinQueue
