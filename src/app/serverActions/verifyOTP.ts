'use server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

type VerificationState = 'verified' | 'not verified'

const verifyOTP = async (
  phoneNumber: string,
  otpCode: string,
): Promise<VerificationState> => {
  const supabase = createServerClient(cookies())

  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneNumber,
    token: otpCode,
    type: 'sms',
  })

  if (error) throw error

  return data !== null ? 'verified' : 'not verified'
}

const checkOTPVerified = async (
  phoneNumber: string,
  otpCode: string,
): Promise<boolean> => {
  return (await verifyOTP(phoneNumber, otpCode)) === 'verified' ? true : false
}

export default checkOTPVerified
