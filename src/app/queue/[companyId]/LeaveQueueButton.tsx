'use client'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

const LeaveQueueButton = () => {
  const [isPending, startTransition] = useTransition()

  const onLeave = async () => {
    startTransition(async () => {
      const toSend = {
        eventName: 'leave-queue',
        data: {
          socketId: socketId,
          companyId: companyId,
        },
      } satisfies QueueActionSchema

      leaveQueueMutate(toSend)

      setIsJoined(false)
    })
  }

  return (
    <Button
      type="button"
      className="flex-1 bg-red-700 hover:bg-red-800"
      size="lg"
      onClick={onLeave}
    >
      Leave Queue
    </Button>
  )
}

export default LeaveQueueButton
