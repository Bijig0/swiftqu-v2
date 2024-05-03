import axiosClient from '@/axios'
import { useMutation } from '@tanstack/react-query'

type Params = {
  onSuccess: (...args: any) => any | void
  onError: (...args: any) => any | void
}

type LeaveQueueInitialValues = {
  eventName: 'leave-queue'
  data: {
    companyId: number
  }
}

type ToPost = {
  eventName: 'leave-queue'
  data: {
    companyId: number
  }
}

const url = '/handleQueue'

const useLeaveQueue = ({ onSuccess, onError }: Params) => {
  const mutation = useMutation({
    mutationFn: async (values: Readonly<LeaveQueueInitialValues>) => {
      const toPost = values satisfies ToPost

      return axiosClient.post(url, toPost)
    },
    onSuccess: onSuccess,
    onError: onError,
  })
  return mutation
}

export default useLeaveQueue
