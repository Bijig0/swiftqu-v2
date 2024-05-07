'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { cookies } from 'next/headers'

type VerificationState = 'verified' | 'not verified'

const verifyOTP = async (
  phoneNumber: string,
  otpCode: string,
): Promise<VerificationState> => {
  const supabase = createServerClient(cookies())

  console.log({ phoneNumber, otpCode })

  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneNumber,
    token: otpCode,
    type: 'sms',
  })

  console.log({ data, error })

  if (error) throw error

  return data !== null ? 'verified' : 'not verified'
}

const checkOTPVerified = async (
  phoneNumber: string,
  otpCode: string,
): Promise<boolean> => {
  const verifiedState = await verifyOTP(phoneNumber, otpCode)
  const isVerified = verifiedState === 'verified'
  return isVerified
}

export default checkOTPVerified
