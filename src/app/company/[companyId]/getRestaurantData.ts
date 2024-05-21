'use server'
import { createServerClient } from '@/utils/supabase/supabase'

const getCompanyData = async (companyId: number) => {
  const supabase = createServerClient()
  try {
    const { data: restaurantDetails, error } = await supabase
      .from('company')
      .select('name,image_url,id')
      .eq('id', companyId)
      .single()

    if (error) throw error

    return restaurantDetails
  } catch (error) {
    throw error
  }
}

// const { data: restaurantDetails, error } = await supabase
//   .rpc('get_restaurant_details', { company_name: parsedRestaurantName })
//   .single()

export default getCompanyData
