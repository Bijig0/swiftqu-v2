import { mock } from 'bun:test'

mock('@supabase/supabase-js', () => {
  let testData = [
    {
      id: 'mockedRoleId',
      org_users: [{ id: 'mockUserId', status: 'active' }],
    },
  ]

  return {
    createClient: jest.fn().mockImplementation(() => {
      return {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          data: testData, // Use the data variable here
          error: null,
        })),
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          data: testData, // Use the data variable here
          error: null,
        })),
      }
    }),
    setTestData: (newData) => {
      testData = newData
    },
  }
})

export const setup = 1
