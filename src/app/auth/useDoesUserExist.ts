import { createBrowserClient } from '@/utils/supabase'
import { useQuery } from '@tanstack/react-query'
import { Tables } from '../types/supabase'

const useDoesUserExist = (phoneNumber: string, enabled: boolean) => {
  const getUser = async (): Promise<Tables<'user_profile'>> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('user_profile')
      .select()
      .eq('phone_number', phoneNumber)
      .single()
    console.log({ data })
    if (error) throw error
    return data
  }

  const result = useQuery({
    queryKey: ['doesUserexist'],
    enabled: enabled,
    queryFn: getUser,
  })

  return result
}

export default useDoesUserExist
