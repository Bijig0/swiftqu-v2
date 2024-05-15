import { Tables } from '@/app/types/supabase'
import { createServerClient } from '@/utils/supabase/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

const paramsSchema = z.object({
  params: z.object({
    queueId: z.number(),
  }),
})

type Params = z.infer<typeof paramsSchema>

export async function GET(request: Request, params: unknown) {
  try {
    const authHeader = request.headers.get('Authorization')

    const {
      params: { queueId },
    } = paramsSchema.parse(params)

    const supabaseClient = createServerClient()

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

    const { data: queueDetails, error } = await supabaseClient
      .from('queuedetails')
      .select()
      .eq('queue_id', queueId)
      .eq('user_profile_id', userProfile.user_profile_id)
      .single()

    console.log({ queueDetails, error })

    if (error) throw error

    const getQueuePosition = async (userProfileId: number, queueId: number) => {
      const { data: sortedUsersInQueue, error: queueError } =
        await supabaseClient
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
      parsedQueueId,
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
