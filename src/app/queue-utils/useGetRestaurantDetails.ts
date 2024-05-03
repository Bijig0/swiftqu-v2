import axiosClient from '@/axios'
import { useQuery } from '@tanstack/react-query'
import { restaurantDetailsSchema } from '../types/types'

const useGetRestaurantDetails = (url: URL | null) => {
  const getRestaurantDetails = async (): Promise<RestaurantDetails> => {
    const response = await axiosClient.get(url?.href!)
    console.log(`Parsing ${JSON.stringify(response.data)}`)
    return restaurantDetailsSchema.parse(response.data)
  }

  const result = useQuery({
    queryKey: ['restaurant', url],
    queryFn: getRestaurantDetails,
    enabled: url !== null,
    staleTime: 0,
  })

  return result
}

export default useGetRestaurantDetails
