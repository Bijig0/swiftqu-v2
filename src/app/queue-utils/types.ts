export const actionType = ['join-queue', 'seat-user', 'leave-queue'] as const

export type ActionType = (typeof actionType)[number]

export type QueueEventResponse =
  | {
      actionType: ActionType
      // self: boolean,
      companyId: number
      status: 'success'
    }
  | {
      status: 'error'
      message: string
    }
