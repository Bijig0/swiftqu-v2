'use server'
import { createServerClient } from '@/utils/supabase/supabase'

const checkUserInQueue = async (companyId: number): Promise<boolean> => {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  //   get user profile data

  console.log({ user, error })

  if (user === null) return false

  const { data: userProfile, error: userProfileError } = await supabase
    .from('user_profile')
    .select('user_profile_id')
    .eq('user_id', user.id)
    .single()

  if (userProfileError) throw userProfileError

  const { data: queueDetails, error: queueDetailsError } = await supabase
    .from('queuedetails')
    .select('queue_id')
    .eq('user_profile_id', userProfile.user_profile_id)
    .single()

  if (queueDetailsError) throw queueDetailsError

  return Boolean(queueDetails)
}

export default checkUserInQueue
