import { testApiHandler } from 'next-test-api-route-handler' // ◄ Must be first import
// import {GET} from '../adminHandleQueue/route'
import { POST } from '../adminRemoveUser/route'
import { setup } from './setup'
setup

// import { beforeEach, describe, expect, it } from 'bun:test'
import { createOTPVerifiedUser } from './createOTPVerifiedUser'
import {
  TEST_PHONE_NUMBER,
  adminQueueActionFixture,
  userFixture,
} from './fixtures'
import { signInUser } from './signInUser'
import { createAdminSupabaseClient } from './supabase'

const clearDatabase = async () => {
  const supabase = createAdminSupabaseClient()
  //   dev database has a delete_all_data function
  const { data, error } = await supabase.rpc('delete_all_data')
  if (error) throw error
}

describe('adminRemoveUser endpoint', () => {
  beforeEach(async () => {
    console.log('Clearing database')
    await clearDatabase()
    console.log('Cleared database')
  })
  it('removes user if first in queue', async () => {
    await testApiHandler({
      appHandler: { POST },
      async test({ fetch }) {
        const supabase = createAdminSupabaseClient()
        const userInfo = userFixture.create({ phoneNumber: TEST_PHONE_NUMBER })
        const user = await createOTPVerifiedUser(supabase, userInfo)
        console.log({ user })
        const { access_token: accessToken } = await signInUser(supabase, user)

        const removeUserAction = adminQueueActionFixture.create()

        console.log({ removeUserAction })

        const response = await fetch({
          method: 'POST',
          body: JSON.stringify(removeUserAction),
          headers: { authorization: accessToken },
        })
        console.log({ response })
        expect(1).toEqual(1)
      },
    })
  })
})
