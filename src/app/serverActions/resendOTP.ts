'use server'

import { createServerClient } from '@/utils/supabase/supabase'

export default async function resendOTP() {
  const supabase = createServerClient()
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
