'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { AuthApiError } from '@supabase/supabase-js'
import { Effect, pipe } from 'effect'
import { cookies } from 'next/headers'

type VerificationState = 'verified' | 'not verified'

const verifyOTP = (
  phoneNumber: string,
  otpCode: string,
): Effect.Effect<VerificationState, Error | AuthApiError> => {
  return pipe(
    Effect.tryPromise(() => {
      const supabase = createServerClient(cookies())
      return supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      })
    }),
    Effect.flatMap(({ data, error }) => {
      if (error) return Effect.fail(error)
      return Effect.succeed('verified' as const)
    }),
  )
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
