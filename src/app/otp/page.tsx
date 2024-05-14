'use client'
import resendOTP from '@/app/serverActions/resendOTP'
import checkOTPVerified from '@/app/serverActions/verifyOTP'
import Urls from '@/app/urls/urls'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { AuthApiError } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import ErrorText from './ErrorText'

type FormValues = {
  otpCode: string
}

const phoneNumberSchema = z.string()

const companySlugSchema = z.string()

const _Otp = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const searchParams = useSearchParams()

  const phoneNumber = phoneNumberSchema.parse(searchParams.get('phoneNumber'))

  const companySlug = companySlugSchema.parse(searchParams.get('companySlug'))

  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  console.log({ phoneNumber })

  const onVerifyOTP = async (values: FormValues) => {
    const otpCode = values.otpCode
    // const chatToken = await createChatToken()
    // console.log({ chatToken })

    startTransition(async () => {
      try {
        const isVerified = await checkOTPVerified(phoneNumber, otpCode)

        const queueUrl = Urls.queue(companySlug)

        console.log({ queueUrl })

        if (isVerified) {
          router.push(queueUrl)
        }
        return
      } catch (error) {
        if (error instanceof AuthApiError) {
          console.log('AuthApiError')
          setErrorMessage('Code invalid or expired')
        } else if (error instanceof Error) {
          setErrorMessage('Oops, Something went wrong')
        }
        reset()
        return
      }
    })
  }

  const isSixDigits = (value: string) => value.length === 6

  return (
    <form
      onSubmit={handleSubmit(onVerifyOTP)}
      className="flex flex-col items-center justify-center px-8 py-16 sm:max-w-md"
    >
      <h1 className="text-xl font-bold">
        We've sent a one-time password to your phone
      </h1>
      <div className="my-4" />
      <Controller
        name="otpCode"
        control={control}
        defaultValue=""
        rules={{
          required: 'OTP code is required',
          minLength: {
            value: 6,
            message: 'OTP Code must be 6 digits',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <InputOTP
            maxLength={6}
            onChange={(newValue) => {
              onChange(newValue)
              if (isSixDigits(newValue)) {
                console.log('six digits')
                handleSubmit(onVerifyOTP)()
                return
              }
              console.log('not six digits')
              console.log({ newValue })
            }}
            value={value}
          >
            <InputOTPGroup>
              <InputOTPSlot className="h-14 w-14" index={0} />
              <InputOTPSlot className="h-14 w-14" index={1} />
              <InputOTPSlot className="h-14 w-14" index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot className="h-14 w-14" index={3} />
              <InputOTPSlot className="h-14 w-14" index={4} />
              <InputOTPSlot className="h-14 w-14" index={5} />
            </InputOTPGroup>
          </InputOTP>
        )}
      />
      <div className="my-2" />
      {errors.otpCode && <ErrorText>{errors.otpCode.message}</ErrorText>}
      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      <button onClick={resendOTP} className="self-end text-blue-400">
        Resend Code
      </button>
      <div className="my-1" />
      <Link href={Urls.company(companySlug)} className="self-end text-blue-400">
        Use a different phone number
      </Link>
      <div className="my-2" />
      {/* <Button>
      </Button>{' '} */}
      <Button
        type="submit"
        className="text-md h-14 w-full rounded-xl"
        size="lg"
      >
        {isPending ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  )
}

const client = new QueryClient()

const Otp = () => {
  return (
    <QueryClientProvider client={client}>
      <_Otp />
    </QueryClientProvider>
  )
}

export default Otp
