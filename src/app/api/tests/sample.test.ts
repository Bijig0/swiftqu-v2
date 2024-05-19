import { testApiHandler } from 'next-test-api-route-handler' // ◄ Must be first import
// import {GET} from '../adminHandleQueue/route'
import { POST } from '../adminHandleQueue/route'

// import { beforeEach, describe, expect, it } from 'bun:test'
import { createAdminSupabaseClient } from './supabase'

const clearDatabase = async () => {
  const supabase = createAdminSupabaseClient()
  //   dev database has a delete_all_data function
  const { data, error } = await supabase.rpc('delete_all_data')
  if (error) throw error
}

// describe('adminProfileDetails endpoint', () => {
//   beforeEach(async () => {
//     await clearDatabase()
//   })
//   it('retrieves admin profile details', async () => {
//     await testApiHandler({
//       appHandler: { GET },
//       async test({ fetch }) {
//         const response = await fetch({ method: 'GET' })
//         expect(1).toEqual(1)
//       },
//     })
//   })
// })

// describe('adminHandleQueue endpoint', () => {
//   beforeEach(async () => {
//     await clearDatabase()
//   })
//   it('removes user if first in queue', async () => {
//     await testApiHandler({
//       appHandler: { POST },
//       async test({ fetch }) {
//         const response = await fetch({ method: 'POST', body: "", p })
//         expect(1).toEqual(1)
//       },
//     })
//   })
// })
