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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { checkUserHasProfile } from '../queue-utils/checkUserHasProfile'
import ErrorText from './ErrorText'
import { createUserProfile } from './createUserProfile'
import joinQueue from '../serverActions/joinQueue'

type FormValues = {
  otpCode: string
}

const otpSchema = z.object({
  phoneNumber: z.string(),
  name: z.string(),
  companyId: z.string().transform((val) => parseInt(val)),
})

const _Otp = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const searchParams = useSearchParams()

  const phoneNumberQueryParam = searchParams.get('phoneNumber')
  const nameQueryParam = searchParams.get('name')
  const companyIdParam = searchParams.get('companyId')

  const queryParams = {
    phoneNumber: phoneNumberQueryParam,
    name: nameQueryParam,
    companyId: companyIdParam,
  }

  const parsedQueryParams = otpSchema.parse(queryParams)

  const { companyId, ...userInfo } = parsedQueryParams

  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  // console.log({ phoneNumber })

  const onVerifyOTP = async (values: FormValues) => {
    const otpCode = values.otpCode
    // const chatToken = await createChatToken()
    // console.log({ chatToken })

    startTransition(async () => {
      const { phoneNumber, name } = userInfo
      try {
        await checkOTPVerified(phoneNumber, otpCode)

        await joinQueue(companyId, phoneNumber)

        const userHasProfile = await checkUserHasProfile(userInfo)

        console.log({ userHasProfile })

        if (!userHasProfile) {
          const userProfile = await createUserProfile(userInfo)
        }

        const queueUrl = Urls.queue(companyId)

        console.log({ queueUrl })

        router.push(queueUrl)

        return
      } catch (error) {
        if (error instanceof Error) {
          const INVALID_OTP_CODE_MESSAGE = 'Token has expired or is invalid'
          console.log({ error })
          if (error.message === INVALID_OTP_CODE_MESSAGE) {
            const CORRECTED_INVALID_OTP_CODE_MESSAGE =
              'Code is invalid or expired. Please try again'
            setErrorMessage(CORRECTED_INVALID_OTP_CODE_MESSAGE)
          } else {
            setErrorMessage('Oops, Something went wrong')
          }
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
      <Link href={Urls.company(companyId)} className="self-end text-blue-400">
        Use a different phone number
      </Link>
      <div className="my-2" />
      {/* <Button>
      </Button>{' '} */}
      <Button
        type="submit"
        className="w-full text-md h-14 rounded-xl"
        size="lg"
      >
        {isPending ? (
          <Loader2 className="w-8 h-8 mx-auto animate-spin" />
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
