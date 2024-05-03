// Pusher chanel to send to all members of the queue
const createQueueChannelName = (queueId: number) => {
  return `queue-${queueId}`
}

export default createQueueChannelName
