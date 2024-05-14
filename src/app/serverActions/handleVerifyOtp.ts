'use server'
import { cookies } from 'next/headers'
import { serverClient } from '../queue-utils/utils/getstream'
import { createServerClient } from '@/utils/supabase/supabase'

const createChatToken = async () => {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userProfile, error } = await supabase
    .from('user_profile')
    .select('chat_id')
    .eq('user_id', user?.id)
    .single()

  if (error) throw error

  const chatToken = serverClient.createToken(userProfile?.chat_id)
  return chatToken
}

export default createChatToken
