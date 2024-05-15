'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { UserInfoFormValues } from '../form'

export type UserInfo = UserInfoFormValues

export const checkUserHasProfile = async (
  userInfo: UserInfo,
): Promise<boolean> => {
  console.log({ userInfo })
  const supabase = createServerClient()

  const { count, error } = await supabase
    .from('user_profile')
    .select('user_profile_id,chat_id,phone_number', {
      count: 'exact',
      head: true,
    })
    .eq('phone_number', userInfo.phoneNumber)

  console.log({ count })

  if (error || !count) throw error

  if (count > 1) throw new Error('User has multiple profiles')

  return count === 1
}
