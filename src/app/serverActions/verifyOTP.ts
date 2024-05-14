'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import * as Schema from '@effect/schema/Schema'
import { Effect, pipe } from 'effect'
import { UnknownException } from 'effect/Cause'
import { cookies } from 'next/headers'

const verificationStates = ['verified', 'not verified'] as const

const verificationStatesSchema = Schema.Literal(...verificationStates)

import { AuthError } from '@supabase/supabase-js'
class MyAuthError extends Schema.TaggedError<AuthError>()('AuthError', {}) {}
class MyUnknownException extends Schema.TaggedError<UnknownException>()(
  'UnknownException',
  {},
) {}

const exitSchema = Schema.Exit({
  success: verificationStatesSchema,
  failure: Schema.Union(MyAuthError, MyUnknownException),
})

const serialize = Schema.encodeSync(exitSchema)

type VerificationState = (typeof verificationStates)[number]

const checkOTPVerified = (phoneNumber: string, otpCode: string) => {
  return Effect.runPromise(
    pipe(
      Effect.tryPromise(() => {
        const supabase = createServerClient(cookies())
        console.log({ otpCode })
        return supabase.auth.verifyOtp({
          phone: '61403057369',
          token: otpCode,
          type: 'sms',
        })
      }),
      Effect.flatMap(({ data, error }) => {
        console.log({ data, error })
        if (error) return Effect.fail(error)
        return Effect.succeed('verified' as const)
      }),
    ),
  )
}

export default checkOTPVerified
