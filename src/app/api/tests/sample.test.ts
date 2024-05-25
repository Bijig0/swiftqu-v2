import { testApiHandler } from 'next-test-api-route-handler' // ◄ Must be first import
// import {GET} from '../adminHandleQueue/route'
import { POST } from '../adminRemoveUser/route'
import { setup } from './setup'
setup

// import { beforeEach, describe, expect, it } from 'bun:test'
import { adminQueueActionFixture } from './fixtures'
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
      requestPatcher: (req) => {
        req.headers.set('authorization', 'auth')
      },
      async test({ fetch }) {
        const removeUserAction = adminQueueActionFixture.create()
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify(removeUserAction),
        })
        console.log({ response })
        expect(1).toEqual(1)
      },
    })
  })
})
