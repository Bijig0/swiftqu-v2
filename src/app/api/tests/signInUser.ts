import { SupabaseClient } from '@supabase/supabase-js'
import { UserInfo } from './createOTPVerifiedUser'
import { TEST_OTP_CODE } from './fixtures'

export const signInUser = async (supabase: SupabaseClient, user: UserInfo) => {
  await supabase.auth.signInWithOtp({
    phone: user.phoneNumber,
  })
  const { data, error } = await supabase.auth.verifyOtp({
    phone: user.phoneNumber,
    token: TEST_OTP_CODE,
    type: 'sms',
  })

  if (error) throw error

  const session = data.session

  if (!session) throw new Error('No session')

  return session
}
