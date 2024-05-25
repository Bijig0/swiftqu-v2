import { SupabaseClient } from '@supabase/supabase-js'
import { pipe } from 'effect'
import { objectToSnake } from 'ts-case-convert'

export type UserInfo = {
  phoneNumber: string
  name: string
}

export const createOTPVerifiedUser = async (
  supabase: SupabaseClient,
  userInfo: UserInfo,
): Promise<UserInfo> => {
  const { phoneNumber, name } = userInfo
  const {
    data: { user },
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    phone: phoneNumber,
    phone_confirm: true,
  })

  if (createUserError || !user) throw createUserError

  const transformedUserInfo = pipe(
    userInfo,
    objectToSnake,
    (userInfo) => ({
      ...userInfo,
      is_otp_verified: true,
    }),
    (userInfo) => ({ ...userInfo, user_id: user.id }),
  )

  const { data: userProfile, error: createUserProfileError } = await supabase
    .from('user_profile')
    .insert(transformedUserInfo)
    .select('name,chat_id,phone_number')
    .single()

  console.log({ userProfile, createUserProfileError })

  if (createUserProfileError) throw createUserProfileError

  return userInfo
}
