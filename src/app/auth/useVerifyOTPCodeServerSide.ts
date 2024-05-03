import axiosClient from '@/axios'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

type Params = {
  onSuccess: (...args: any) => any | void
  onError: (...args: any) => any | void
}

type VerifyOTPCodeInitialValues = {
  otpCode: string
  phoneNumber: string
}

type ToPost = {
  otpCode: string
  phoneNumber: string
}

const verifyOTPSchema = z.object({
  phoneNumber: z.string(),
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  chatToken: z.string(),
  chatId: z.string(),
})

type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>
export type VerifyOTPSchemaWithTokens = VerifyOTPSchema

const url = '/verifyOTPCode'

const useVerifyOTPCodeServerSide = ({ onSuccess, onError }: Params) => {
  const mutation = useMutation({
    mutationFn: async (
      values: Readonly<VerifyOTPCodeInitialValues>,
    ): Promise<VerifyOTPSchemaWithTokens> => {
      const toPost = values satisfies ToPost

      const response = await axiosClient.post(url, toPost)

      const verifyOTPResponse = verifyOTPSchema.parse(response.data)

      return verifyOTPResponse
    },
    onSuccess: onSuccess,
    onError: onError,
  })
  return mutation
}

export default useVerifyOTPCodeServerSide
