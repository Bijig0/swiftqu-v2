import { defineFixture } from 'efate'
import {
  AdminQueueActionDataSchema,
  AdminQueueActionSchema,
  UserToInteractWithSchema,
} from '../utils/types'
import { UserInfo } from './createOTPVerifiedUser'

// These are hardcoded values for phone number otp auth
// you can find the values in supbase authentication providers dashboard for twilio
export const TEST_PHONE_NUMBER = '+61403057369'

export const TEST_OTP_CODE = '123456'

export const adminQueueActionFixture = defineFixture<AdminQueueActionSchema>(
  (t) => {
    t.eventName.asString(),
      t.data.fromFixture(
        defineFixture<AdminQueueActionDataSchema>((t) => {
          t.adminChannelName.asString(),
            t.companyId.asNumber(),
            t.socketId.asString(),
            t.queueChannelName.asString()
          t.userToInteractWith.fromFixture<UserToInteractWithSchema>(
            defineFixture((t) => {
              t.name.asString(), t.userProfileId.asNumber()
            }),
          )
        }),
      )
  },
)

export const userFixture = defineFixture<UserInfo>((t) => {
  t.name.asString(), t.phoneNumber.asNumber()
})
