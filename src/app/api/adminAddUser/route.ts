import { alertRestaurantOfSuccessfulJoin } from '@/app/queue-utils/alertRestaurantOfSuccessfulJoin'
import { addUserToQueue } from '@/app/queue-utils/functions'
import { z } from 'zod'
import {
  createAdminSupabaseClient,
  createAuthorizedAdminSupabaseClient,
} from '../supabase'
import { corsHeaders } from '../utils/cors'

export { OPTIONS } from '../utils/cors'

const userToInteractWithSchema = z.object({
  name: z.string(),
  //   phoneNumber: z.string().optional(),
})

const adminQueueActionSchema = z.object({
  eventName: z.string(),
  data: z.object({
    companyId: z.number(),
    socketId: z.string(),
    userToInteractWith: userToInteractWithSchema,
    adminChannelName: z.string(),
  }),
})

type UserToInteractWith = {
  name: string | null
  //   phoneNumber: string | null
  user_profile_id: number
}

export async function POST(request: Request, params: unknown) {
  try {
    const authKey = request.headers.get('authorization')

    if (!authKey) throw new Error('No auth header')

    const supabaseClient = createAuthorizedAdminSupabaseClient(authKey)
    const adminSupabaseClient = createAdminSupabaseClient()

    const body = await request.json()

    const queueAction = adminQueueActionSchema.parse(body)

    const name = queueAction.data.userToInteractWith.name

    const companyId = queueAction.data.companyId

    const createUnverifiedUser = async (): Promise<UserToInteractWith> => {
      const {
        data: { user },
        error,
      } = await adminSupabaseClient.auth.signInAnonymously({
        options: {
          data: {
            name: name,
          },
        },
      })

      console.log({ user, error })

      if (!user || error) throw error

      const userInfo = {
        user_id: user.id,
        name: name,
        is_otp_verified: false,
      }

      console.log({ userInfo })

      const { data: userProfile, error: userProfileError } =
        await adminSupabaseClient
          .from('user_profile')
          .upsert(userInfo, { onConflict: 'user_id' })
          .select('name,chat_id,is_otp_verified,user_profile_id')
          .single()

      console.log({ userProfile, userProfileError })

      if (userProfileError) throw userProfileError

      const userProfileInfo = {
        user_profile_id: userProfile?.user_profile_id,
        name: name,
      } satisfies UserToInteractWith

      return userProfileInfo
    }

    const addedUser = await createUnverifiedUser()

    await addUserToQueue(supabaseClient, companyId, addedUser)

    console.log('Added')

    await alertRestaurantOfSuccessfulJoin(companyId)

    console.log('Testing')

    return Response.json(
      { detail: 'ok' },
      { status: 200, headers: corsHeaders },
    )
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      console.error(JSON.stringify(error, null, 2))
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
