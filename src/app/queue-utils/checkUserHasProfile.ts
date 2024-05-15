'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { UserInfoFormValues } from '../form'

export type UserInfo = UserInfoFormValues

export const checkUserHasProfile = async (userInfo: UserInfo) => {
  const supabase = createServerClient()

  const { data: userProfile, error } = await supabase
    .from('user_profile')
    .select('user_profile_id,chat_id,phone_number', {
      count: 'exact',
      head: true,
    })
    .eq('phone_number', userInfo.phoneNumber)

  if (error) throw error

  return userProfile
}
