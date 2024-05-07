'use server'

import { createServerClient } from '@/utils/supabase/supabase'
import { cookies } from 'next/headers'

export default async function resendOTP() {
  const cookiesStore = cookies()
  const supabase = createServerClient(cookiesStore)
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: 'email@example.com',
    options: {
      emailRedirectTo: 'https://example.com/welcome',
    },
  })

  if (error) throw error

  return data
}
