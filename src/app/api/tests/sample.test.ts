import { beforeEach, describe, expect, it } from 'bun:test'
import { createAdminSupabaseClient } from './supabase'

describe('sample test', () => {
  beforeEach(async () => {
    const clearDatabase = async () => {
      const supabase = createAdminSupabaseClient()
      //   dev database has a delete_all_data function
      const { data, error } = await supabase.rpc('delete_all_data')
      if (error) throw error
    }

    await clearDatabase()

    console.log('before each')
  })

  it('sample test', () => {
    expect(true).toBe(true)
  })
})
