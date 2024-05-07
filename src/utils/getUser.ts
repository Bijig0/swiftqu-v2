import { cookies } from 'next/headers'
import { createServerClient } from './supabase/supabase'

const getUser = async () => {
  const supabase = createServerClient(cookies())
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data
}

export default getUser
