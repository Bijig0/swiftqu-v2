// Pusher chanel to send only to a single user of the queue
const getOrCreateUserChannelName = (queueId: number, userId: string) => {
  return `queue-${queueId}-${userId}`
}

export default getOrCreateUserChannelName
