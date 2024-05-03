import { SupabaseClient, User } from '@supabase/supabase-js'
import { TriggerParams } from 'pusher'
import { initPusher } from '../api/utils/pusher'
import { Database, Tables } from '../types/supabase'
import { QueueEventResponse } from './types'
import createChatChannelName from './utils/createChatChannelName'
import getOrCreateAdminChannelName from './utils/getOrCreateAdminChannelName'

const pusher = initPusher()

type AppSupabaseClient = SupabaseClient<Database, 'public', Database['public']>

export const getRestaurantAdmin = async (
  supabaseClient: AppSupabaseClient,
  companyId: number,
) => {
  const { data: restaurantAdmin, error } = await supabaseClient
    .from('user_profile')
    .select()
    .eq('is_restaurant_admin', true)
    .eq('company_id', companyId)
    .single()
  if (error || !restaurantAdmin) throw error
  return restaurantAdmin
}

export const getUserChatId = async (
  supabaseClient: AppSupabaseClient,
  user: Pick<User, 'id'>,
) => {
  const { data: userChatId, error: userChatIdError } = await supabaseClient
    .from('user_profile')
    .select('chat_id')
    .eq('user_id', user.id)
    .single()
  if (!userChatId || userChatIdError) throw userChatIdError
  return userChatId.chat_id
}

export const triggerQueueEvent = async (
  channelName: string,
  eventName: ActionType,
  data: QueueEventResponse,
  params?: TriggerParams | undefined,
) => {
  await pusher.trigger(channelName, eventName, data, params)
}

export const addUserToQueue = async (
  supabaseClient: AppSupabaseClient,
  companyId: number,
  userProfile: Pick<
    Tables<'user_profile'>,
    'user_profile_id' | 'chat_id' | 'phone_number'
  >,
) => {
  if (!userProfile.phone_number)
    throw new Error('User profile does not have a phone number')

  const chatChannelId = createChatChannelName(userProfile.chat_id, companyId)

  const addToQueueDB = async (companyId: number, userProfileId: number) => {
    return await supabaseClient.from('queuedetails').insert({
      queue_id: companyId,
      user_profile_id: userProfileId,
      chat_channel_id: chatChannelId,
    })
  }

  const { error: queueDetailsError } = await addToQueueDB(
    companyId,
    userProfile.user_profile_id,
  )

  if (queueDetailsError) throw queueDetailsError
}

export const alertRestaurantOfSuccessfulJoin = async (companyId: number) => {
  const joinQueueResponse = {
    actionType: 'join-queue',
    companyId: companyId,
    status: 'success',
  } satisfies QueueEventResponse

  const adminChannelName = getOrCreateAdminChannelName(companyId)

  triggerQueueEvent(adminChannelName, 'join-queue', joinQueueResponse)
}