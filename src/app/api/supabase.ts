import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const SUPABASE_URL = 'https://scrmsjlquvjrygoyfvko.supabase.co'

const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcm1zamxxdXZqcnlnb3lmdmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYxNTQyNDksImV4cCI6MjAyMTczMDI0OX0.1eB-WmYkdAQvAZRptZz_NEIvTcZfdRYYUR3PfFaHD38'

const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcm1zamxxdXZqcnlnb3lmdmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjE1NDI0OSwiZXhwIjoyMDIxNzMwMjQ5fQ.8KpxlEFOj71p954bDJRcu9QI17oKflq2Y2ax8jqDTuo'

export const createAuthorizedAdminSupabaseClient = (authKey: string) => {
  const client = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    global: { headers: { Authorization: authKey } },
  })

  return client
}

export const createAdminSupabaseClient = () => {
  const client = createClient<Database>(SUPABASE_URL, SERVICE_KEY)

  return client
}
