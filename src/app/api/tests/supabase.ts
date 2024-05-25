// Setup for the test supabase project/server
import { Database } from '@/app/types/supabase'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ijuahdthypdhwzeyrrtl.supabase.co'

const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdWFoZHRoeXBkaHd6ZXlycnRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjA3NzA5MSwiZXhwIjoyMDMxNjUzMDkxfQ._wDH1vS50IVB3M7AunJBFYYDcprAd1kxRotG9LlDi1w'

export const createAdminSupabaseClient = () => {
const client = createClient<Database>(SUPABASE_URL, SERVICE_KEY)

return client
}
