'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { cookies } from 'next/headers'

type AuthenticatedState = 'authenticated' | 'not authenticated'

async function signUpWithEmail(email: string): Promise<AuthenticatedState> {
  const supabase = createServerClient(cookies())
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'example-password',
    options: {
      emailRedirectTo: 'http://localhost:3000/queue/1',
    },
  })

  console.log({ data })

  // const { data, error } = await client.auth.setSession({
  //   access_token: 'value',
  //   refresh_token: 'value',
  // })

  if (error) throw error

  return data.user?.aud === 'authenticated'
    ? 'authenticated'
    : 'not authenticated'
}

export default signUpWithEmail
