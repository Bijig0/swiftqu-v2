import { defineFixture } from 'efate'
import {
  AdminQueueActionDataSchema,
  AdminQueueActionSchema,
  UserToInteractWithSchema,
} from '../utils/types'

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
