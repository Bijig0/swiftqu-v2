'use server'
import { createServerClient } from '@/utils/supabase/supabase'

const checkUserInQueue = async (companyId: number): Promise<boolean> => {
  const supabase = createServerClient()
  try {
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

    console.log({ userProfile, error: userProfileError })

    if (userProfileError) throw userProfileError

    // Should check if user is in queue

    const { data: queueDetails, error: queueDetailsError } = await supabase
      .from('queuedetails')
      .select('queue_id')
      .eq('queue_id', companyId)
      .eq('user_profile_id', userProfile.user_profile_id)

    console.log({ queueDetails, error: queueDetailsError })

    if (queueDetailsError) throw queueDetailsError

    return queueDetails.length !== 0
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      console.error(error)
      return false
    }
  }
}

export default checkUserInQueue
