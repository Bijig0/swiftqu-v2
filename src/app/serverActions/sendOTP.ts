'use server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

const sendOTP = async (phoneNumber: string) => {
  const supabase = createServerClient(cookies())

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber,
  })

  if (error) throw error

  return data
}

export default sendOTP
