'use client'
import checkOTPVerified from '@/app/serverActions/verifyOTP'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const paramsSchema = z.object({
  params: z.object({
    companyId: z.string().transform((val) => parseInt(val)),
  }),
})

type Params = z.infer<typeof paramsSchema>

type FormValues = {
  code: string
}

const emailSchema = z.string()

const Otp = (params: unknown) => {
  const {
    params: { companyId },
  } = paramsSchema.parse(params)

  const searchParams = useSearchParams()

  const email = emailSchema.parse(searchParams.get('email'))

  console.log({ email })

  const onVerifyOTP = async (values: FormValues) => {
    const code = values.code
    // const chatToken = await createChatToken()
    // console.log({ chatToken })
    const isVerified = await checkOTPVerified(email, code)
    console.log({ isVerified })
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  return (
    <form
      onSubmit={handleSubmit(onVerifyOTP)}
      className="flex flex-col items-center justify-center px-8 py-16 sm:max-w-md"
    >
      <h1 className="text-xl font-bold">We've sent a link to your email</h1>
    </form>
  )
}

export default Otp
