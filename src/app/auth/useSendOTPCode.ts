import { createBrowserClient } from '@/utils/supabase'
import { useMutation } from '@tanstack/react-query'

type Params = {
  onSuccess: (...args: any) => any | void
  onError: (...args: any) => any | void
}

type SendOTPCodeInitialValues = {
  phoneNumber: string
}

type ToPost = {
  phone_number: string
}

const url = '/user/auth/otp-code/'

const useSendOTPCode = ({ onSuccess, onError }: Params) => {
  const mutation = useMutation({
    mutationFn: async (values: Readonly<SendOTPCodeInitialValues>) => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: values.phoneNumber,
      })

      console.log({ data, error })

      if (error) throw error

      console.log({ data })

      return data
    },
    onSuccess: onSuccess,
    onError: onError,
  })
  return mutation
}

export default useSendOTPCode
