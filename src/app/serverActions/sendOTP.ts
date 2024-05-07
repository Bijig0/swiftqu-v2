'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { cookies } from 'next/headers'

const sendOTP = async (phoneNumber: string) => {
  const supabase = createServerClient(cookies())

  console.log({ phoneNumber })

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber,
  })

  if (error) throw error

  console.log({ data })

  return data
}

export default sendOTP
