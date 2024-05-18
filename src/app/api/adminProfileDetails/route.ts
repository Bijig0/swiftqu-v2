import { assertNotUndefined } from '@/app/queue-utils/utils/assertNotUndefined'
import { serverClient } from '@/utils/getstream'
import { z } from 'zod'
import { createAuthorizedAdminSupabaseClient } from '../supabase'
import { corsHeaders } from '../utils/cors'

export { OPTIONS } from '../utils/cors'

const adminSignInResponseSchema = z.object({
  userId: z.string(),
  chatToken: z.string(),
  chatId: z.string(),
})

type AdminSignInResponse = z.infer<typeof adminSignInResponseSchema>

export async function GET(request: Request, params: unknown) {
  try {
    const authKey = request.headers.get('authorization')

    if (!authKey) throw new Error('No Auth Header provided')

    const supabaseClient = createAuthorizedAdminSupabaseClient(authKey)

    const { data, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !data) throw userError

    assertNotUndefined(data)
    assertNotUndefined(data.user)

    const { data: userProfile, error: userProfileError } = await supabaseClient
      .from('user_profile')
      .select('user_profile_id,chat_id,phone_number,is_restaurant_admin')
      .eq('user_id', data.user.id)
      .single()

    if (!userProfile?.is_restaurant_admin)
      throw new Error(
        'user is not an admin. Only admins can access this endpoint',
      )

    if (userProfileError || !userProfile) throw userProfileError

    if (userProfile.chat_id === null)
      throw new Error(
        `chat id null for user with phone number ${userProfile.phone_number}`,
      )

    const chatToken = serverClient.createToken(userProfile.chat_id)

    const response = {
      userId: data.user.id,
      chatToken: chatToken,
      chatId: userProfile.chat_id,
    } satisfies AdminSignInResponse

    console.log({ response })

    return Response.json(response, { status: 200, headers: corsHeaders })
  } catch (error) {
    if (error instanceof Error) {
      console.error({ error })
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }
  }
}
