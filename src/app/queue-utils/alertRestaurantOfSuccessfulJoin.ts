import { createServerClient } from '@/utils/supabase/supabase'
import { triggerQueueEvent } from './functions'
import { QueueEventResponse } from './types'

export const alertRestaurantOfSuccessfulJoin = async (companyId: number) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('queue')
    .select('admin_realtime_channel_name')
    .eq('company_id', companyId)
    .single()

  if (error) throw error

  const restaurantChannelName = data.admin_realtime_channel_name!

  const joinQueueResponse = {
    actionType: 'join-queue',
    companyId: companyId,
    status: 'success',
  } satisfies QueueEventResponse

  triggerQueueEvent(restaurantChannelName, 'join-queue', joinQueueResponse)
}
