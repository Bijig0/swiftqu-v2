import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import axiosClient from '../../axios'

type Params = {
  onSuccess: (...args: any) => any | void
  onError: (...args: any) => any | void
}

type JoinQueueInitialValues = {
  eventName: 'join-queue'
  data: {
    companyId: number
  }
}

type ToPost = {
  eventName: 'join-queue'
  data: {
    companyId: number
  }
}

const url = '/handleQueue'

const okResponseSchema = z.object({
  detail: z.literal('ok'),
})

const useJoinQueue = ({ onSuccess, onError }: Params) => {
  const mutation = useMutation({
    mutationFn: async (values: Readonly<JoinQueueInitialValues>) => {
      const toPost = values satisfies ToPost

      console.log('Joining Queue')

      const response = axiosClient.post(url, toPost)

      const parsedResponse = okResponseSchema.parse((await response).data)

      console.log('Joined Queue')

      return parsedResponse
    },
    onSuccess: onSuccess,
    onError: onError,
  })
  return mutation
}

export default useJoinQueue
