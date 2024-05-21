import { z } from 'zod'
import { assertNotUndefined } from '../../queue-utils/utils/assertNotUndefined'
import { createAuthorizedAdminSupabaseClient } from '../supabase'
import { corsHeaders } from '../utils/cors'

export { OPTIONS } from '../utils/cors'

const addRestaurantDetailsAddons = (
  restaurantDetails: any,
  pusherQueueChannelName: string,
): any => {
  const addQueueDetailsURL = (restaurantDetails: any) => {
    const queueDetailsURL = `/queueDetail?queueId=${restaurantDetails.id}`
    return { ...restaurantDetails, queueDetailsURL }
  }

  return addQueueDetailsURL({
    ...restaurantDetails,
    pusherQueueChannelName,
  })
}

const restaurantNameQueryParamSchema = z.string()

const queueDetailSchema = z.object({
  user_profile_id: z.number(),
  name: z.string(),
  phone_number: z.string(),
  position: z.number(),
  estimated_wait_time: z.number(),
  joined_at: z.string(),
  chat_channel_id: z.string().nullable(),
})

export type QueueDetail = z.infer<typeof queueDetailSchema>

const queueDetailsSchema = z.array(queueDetailSchema)

export type QueueDetails = z.infer<typeof queueDetailsSchema>

export const adminRestaurantDetailsSchema = z.object({
  name: z.string(),
  id: z.number(),
  image_url: z.string(),
  queue_length: z.number(),
  pusherQueueChannelName: z.string(),
  pusherAdminQueueChannelName: z.string(),
  queue: queueDetailsSchema,
  estimated_wait_time: z.number(),
})

export type AdminRestaurantDetails = z.infer<
  typeof adminRestaurantDetailsSchema
>

export async function GET(request: Request, params: unknown) {
  try {
    const authKey = request.headers.get('authorization')

    if (!authKey) throw new Error('No auth header')

    const supabaseClient = createAuthorizedAdminSupabaseClient(authKey)

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) throw new Error('No user found')

    const { data: userProfile, error: userProfileError } = await supabaseClient
      .from('user_profile')
      .select('chat_id,is_restaurant_admin,company(name)')
      .eq('user_id', user?.id)
      .single()

    console.log({ userProfile, userProfileError })

    if (userProfileError) throw userProfileError

    if (userProfile.company?.name === undefined)
      throw new Error('User is not a restaurant admin')

    const restaurantName = userProfile.company.name

    const parsedRestaurantName =
      restaurantNameQueryParamSchema.parse(restaurantName)

    assertNotUndefined(userProfile)

    console.log({ parsedRestaurantName })

    const { data: restaurantDetails, error } = await supabaseClient
      .rpc('get_restaurant_details', { company_name: parsedRestaurantName })
      .single()

    console.log({ restaurantDetails, error })

    if (error) throw error

    const queueChannelName = restaurantDetails.queue_realtime_channel_name

    const withAddOns = addRestaurantDetailsAddons(
      restaurantDetails,
      queueChannelName,
    )

    const pusherAdminQueueChannelName =
      restaurantDetails.admin_realtime_channel_name

    const withAdminQueueChannelName = {
      ...withAddOns,
      pusherAdminQueueChannelName,
    }

    const addQueue = async (
      restaurantDetails: any & {
        pusherAdminQueueChannelName: string
      },
    ): Promise<AdminRestaurantDetails> => {
      const { data: queue, error } = await supabaseClient.rpc(
        'get_queue_users',
        {
          company_id: restaurantDetails.id,
        },
      )

      if (!queue || error) throw error

      const withQueue = { ...restaurantDetails, queue }
      return withQueue
    }

    const withQueue = await addQueue(withAdminQueueChannelName)

    withQueue satisfies AdminRestaurantDetails

    console.log({ withQueue })

    return Response.json(withQueue, { status: 200, headers: corsHeaders })
  } catch (error) {
    if (error instanceof Error) {
      console.error({ error })
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
