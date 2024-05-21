'use server'
import { triggerQueueEvent } from '@/app/queue-utils/functions'
import { QueueEventResponse } from '@/app/queue-utils/types'
import { createServerClient } from '@/utils/supabase/supabase'

const leaveQueue = async (
  companyId: number,
  socketId: string,
  userChannelName: string,
) => {
  const userWhoInitiatedsSocketId = socketId
  const supabaseClient = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser()

  if (userError || !user) throw userError

  const { data: userProfile, error: userProfileError } = await supabaseClient
    .from('user_profile')
    .select('user_profile_id,chat_id,phone_number')
    .eq('user_id', user.id)
    .single()

  if (userProfileError || !userProfile) throw userProfileError

  const { data: queue, error: queueError } = await supabaseClient
    .from('queue')
    .select('admin_realtime_channel_name, queue_realtime_channel_name')
    .eq('queue_id', companyId)
    .single()

  if (queueError || !queue) throw queueError

  const queueChannelName = queue.queue_realtime_channel_name!

  //   if (userIsPhoneNumberVerified) {
  //     const removeUserFromChatChannel = async () => {
  //       const userChatId = await getUserChatId(supabaseClient, user)
  //       assertNotUndefined(userChatId)
  //       const chatChannelName = retrieveChatChannelName(userChatId, companyId)
  //       const channel = serverClient.channel('messaging', chatChannelName)
  //       await channel.update({ disabled: true })
  //     }

  //     await removeUserFromChatChannel()
  //   }

  const removeUserFromQueue = async () => {
    const { error } = await supabaseClient
      .from('queuedetails')
      .delete()
      .eq('queue_id', companyId)
      .eq('user_profile_id', userProfile.user_profile_id)
    if (error) throw error
  }

  const alertUserOfSuccessfulLeave = async () => {
    const toSend = {
      actionType: 'leave-queue',
      companyId: companyId,
      status: 'success',
    } satisfies QueueEventResponse

    triggerQueueEvent(userChannelName, 'leave-queue', toSend)
  }

  const alertOtherUsersOfSuccessfulLeave = async () => {
    const toSend = {
      actionType: 'leave-queue',
      companyId: companyId,
      status: 'success',
    } satisfies QueueEventResponse

    // Passing in socketId excludes the singular client who we notify through alertClientOfSuccesfulLeave

    triggerQueueEvent(queueChannelName, 'leave-queue', toSend, {
      socket_id: userWhoInitiatedsSocketId,
    })
  }

  await removeUserFromQueue()
  await alertUserOfSuccessfulLeave()
  await alertOtherUsersOfSuccessfulLeave()

  return
}

export default leaveQueue
