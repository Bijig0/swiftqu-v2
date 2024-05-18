import { createServerClient } from '@/utils/supabase/supabase'
import { redirect } from 'next/navigation'
import { Tables } from '../types/supabase'
import Urls from '../urls/urls'

const getQueueDetails = async (companyId: number) => {
  const supabase = createServerClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect(Urls.company(companyId))

    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profile')
      .select('user_profile_id,chat_id,phone_number')
      .eq('user_id', user.id)
      .single()

    if (userProfileError || !userProfile) throw userProfileError

    const { data: queueDetails, error } = await supabase
      .from('queuedetails')
      .select()
      .eq('queue_id', companyId)
      .eq('user_profile_id', userProfile.user_profile_id)
      .single()

    console.log({ queueDetails, error })

    if (error) throw error

    const getQueuePosition = async (
      userProfileId: number,
      companyId: number,
    ) => {
      const { data: sortedUsersInQueue, error: queueError } = await supabase
        .from('queuedetails')
        .select()
        .eq('queue_id', companyId)
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
      companyId,
    )

    const addQueuePosition = (
      queueDetails: Tables<'queuedetails'>,
      position: number,
    ) => {
      return { ...queueDetails, position }
    }

    const withQueuePosition = addQueuePosition(queueDetails, position)

    return withQueuePosition
  } catch (error) {
    throw error
  }
}

export default getQueueDetails
