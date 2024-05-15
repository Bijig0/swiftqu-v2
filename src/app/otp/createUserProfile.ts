'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { objectToSnake } from 'ts-case-convert'
import { createCompliantGetStreamChatId } from '../queue-utils/utils/createChatId'
import { serverClient } from '../queue-utils/utils/getstream'

export type UserInfo = {
  phoneNumber: string
  email: string
  name: string
}

export const createUserProfile = async (userInfo: UserInfo) => {
  const supabase = createServerClient()

  const toSnakeCase = objectToSnake(userInfo)

  const chatId = createCompliantGetStreamChatId(userInfo)

  console.log('Upserting Get Stream User')

  serverClient.upsertUser({ id: chatId, name: chatId, role: 'user' })

  console.log('Upserted Get Stream User')

  const withChatId = { ...toSnakeCase, chat_id: chatId }

  const withOTPVerified = { ...withChatId, is_otp_verified: true }

  // const createWithoutPhoneNumber = <T extends typeof withChatId>({ phone_number, ...rest }: T) => rest;

  const { data: userProfile, error } = await supabase
    .from('user_profile')
    .insert(withOTPVerified)
    .select('first_name,last_name,chat_id,phone_number')
    .single()

  console.log({ userProfile })

  if (error) throw error

  response.status(200).json(userProfile)
}
