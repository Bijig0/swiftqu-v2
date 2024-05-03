// Pusher chanel to send only to the admin of the queue
const getOrCreateAdminChannelName = (queueId: number) => {
  return `queue-${queueId}-admin`
}

export default getOrCreateAdminChannelName
