import axiosClient from '@/axios'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const url = '/userDetails'

const userDetailsSchema = z.object({
  firstName: z.string(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  email: z.string().nullable(),
  userProfileId: z.number(),
})

type UserDetailsSchema = z.infer<typeof userDetailsSchema>

const useUser = () => {
  const getUser = async (): Promise<UserDetailsSchema> => {
    const response = await axiosClient.get(url)
    console.log({ user: response.data })
    return userDetailsSchema.parse(response.data)
  }

  const result = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  })

  return result
}

export default useUser
