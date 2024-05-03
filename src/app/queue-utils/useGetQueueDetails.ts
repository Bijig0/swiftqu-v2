import axiosClient from '@/axios'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const queueDetailsSchema = z.object({
  position: z.number().int(),
  chat_channel_id: z.string(),
})

type QueueDetailsSchema = z.infer<typeof queueDetailsSchema>

const useGetQueueDetails = (
  url: string,
  companyId: number,
  isJoined: boolean,
) => {
  const getQueueDetails = async (): Promise<QueueDetailsSchema> => {
    console.log(`Getting queue detail with url ${url}`)

    const response = await axiosClient.get(url)

    console.log(`Queue detail response received`)
    console.log({ data: response.data })

    const parsedResponse = queueDetailsSchema.parse(response.data)

    return parsedResponse
  }

  const result = useQuery({
    queryKey: ['queueDetails', companyId],
    queryFn: getQueueDetails,
    enabled: isJoined,
    refetchOnWindowFocus: false,
  })

  return result
}

export default useGetQueueDetails
