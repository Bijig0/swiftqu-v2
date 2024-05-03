import { FormValues } from '@/app/form'
import createChatToken from '@/app/serverActions/handleVerifyOtp'
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
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const paramsSchema = z.object({
  params: z.object({
    companyId: z.string().transform((val) => parseInt(val)),
  }),
})

type Params = z.infer<typeof paramsSchema>

type FormValues = {
  otpCode: string
}

const Otp = (params: unknown) => {
  const {
    params: { companyId },
  } = paramsSchema.parse(params)

  const onVerifyOTP = async (values: FormValues) => {
    const otpCode = values.otpCode
    const chatToken = await createChatToken()
    console.log({ chatToken })
    const isVerified = await checkOTPVerified(phoneNumber, otpCode)
    console.log({ isVerified })
  }

  const { control, handleSubmit } = useForm<FormValues>()

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
        render={({ field: { onChange, value } }) => (
          <InputOTP maxLength={6} onChange={onChange} value={value}>
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
      <button onClick={resendOTP} className="self-end text-blue-400">
        Resend Code
      </button>
      <div className="my-1" />
      <Link href={Urls.company(companyId)} className="self-end text-blue-400">
        Use a different phone number
      </Link>
      <div className="my-2" />
      <Button
        type="submit"
        className="text-md h-14 w-full rounded-xl"
        size="lg"
      >
        Continue
      </Button>
    </form>
  )
}

export default Otp
