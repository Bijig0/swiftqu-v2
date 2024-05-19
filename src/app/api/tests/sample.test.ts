import { beforeEach, describe, expect, it } from 'bun:test'

describe('sample test', () => {
  beforeEach(() => {
    console.log('before each')
  })

  it('sample test', () => {
    expect(true).toBe(true)
  })
})
