import { createServerClient } from '@/utils/supabase/supabase'
import { Tables } from '../types/supabase'

const getQueueDetails = async (queueId: number) => {
  const supabase = createServerClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No user found')

    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profile')
      .select('user_profile_id,chat_id,phone_number')
      .eq('user_id', user.id)
      .single()

    if (userProfileError || !userProfile) throw userProfileError

    const { data: queueDetails, error } = await supabase
      .from('queuedetails')
      .select()
      .eq('queue_id', queueId)
      .eq('user_profile_id', userProfile.user_profile_id)
      .single()

    console.log({ queueDetails, error })

    if (error) throw error

    const getQueuePosition = async (userProfileId: number, queueId: number) => {
      const { data: sortedUsersInQueue, error: queueError } = await supabase
        .from('queuedetails')
        .select()
        .eq('queue_id', queueId)
        .order('joined_at')

      if (!sortedUsersInQueue || queueError) throw queueError

      const getPosition = (
        sortedQueueDetails: Tables<'queuedetails'>[],
        userProfileId: number,
      ) => {
        for (const [index, sortedQueueDetail] of sortedQueueDetails.entries()) {
          if (sortedQueueDetail.user_profile_id === userProfileId)
            return index + 1
        }
        throw new Error('User is not in the queue, Invalid queue position')
      }

      const position = getPosition(sortedUsersInQueue, userProfileId)

      return position
    }

    const position = await getQueuePosition(
      userProfile.user_profile_id,
      queueId,
    )

    const addQueuePosition = (
      queueDetails: Tables<'queuedetails'>,
      position: number,
    ) => {
      return { ...queueDetails, position }
    }

    const withQueuePosition = addQueuePosition(queueDetails, position)

    response.status(200).json(withQueuePosition)

    return
  } catch (error) {
    response.status(400).json(error)
    return
  }
}

export default getQueueDetails
