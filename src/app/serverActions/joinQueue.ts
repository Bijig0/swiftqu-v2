'use server'

const joinQueue = async (companyId: number, socketId: string) => {
  const toSend = {
    eventName: 'join-queue',
    data: {
      companyId: companyId,
      socketId: socketId,
    },
  } satisfies QueueActionSchema

  return toSend
}

export default joinQueue
