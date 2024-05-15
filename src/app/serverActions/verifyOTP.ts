'use server'
import isDevMode from '@/utils/isDevMode'
import { createServerClient } from '@/utils/supabase/supabase'
import { Effect, pipe } from 'effect'

const checkOTPVerified = (phoneNumber: string, otpCode: string) => {
  return Effect.runPromise(
    pipe(
      Effect.tryPromise(() => {
        const supabase = createServerClient()
        console.log({ otpCode })
        return supabase.auth.verifyOtp({
          phone: isDevMode ? '+61403057369' : phoneNumber,
          token: isDevMode ? '123456' : otpCode,
          type: 'sms',
        })
      }),
      Effect.flatMap(({ data, error }) => {
        console.log({ data, error })
        if (error) return Effect.fail(error)
        return Effect.succeed(data)
      }),
    ),
  )
}

export default checkOTPVerified
