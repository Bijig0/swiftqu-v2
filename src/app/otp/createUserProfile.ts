'use server'
import { createServerClient } from '@/utils/supabase/supabase'
import { pipe } from 'effect'
import { objectToSnake } from 'ts-case-convert'
import { UserInfoFormValues } from '../form'

export type UserInfo = UserInfoFormValues

export const createUserProfile = async (userInfo: UserInfo) => {
  const supabase = createServerClient()

  const transformedUserInfo = pipe(userInfo, objectToSnake, () => ({
    is_otp_verified: true,
  }))

  // const toSnakeCase = objectToSnake(userInfo)

  // const chatId = createCompliantGetStreamChatId(userInfo)

  // console.log('Upserting Get Stream User')

  // serverClient.upsertUser({ id: chatId, name: chatId, role: 'user' })

  // console.log('Upserted Get Stream User')

  // const withChatId = { ...toSnakeCase, chat_id: chatId }

  // const withOTPVerified = { ...withChatId, is_otp_verified: true }

  // const createWithoutPhoneNumber = <T extends typeof withChatId>({ phone_number, ...rest }: T) => rest;

  const { data: userProfile, error } = await supabase
    .from('user_profile')
    .insert(transformedUserInfo)
    .select('first_name,last_name,chat_id,phone_number')
    .single()

  console.log({ userProfile })

  if (error) throw error

  return userProfile
}
