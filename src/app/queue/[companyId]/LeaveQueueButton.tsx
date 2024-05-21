'use client'
import leaveQueue from '@/app/queue/[companyId]/leaveQueue'
import { useSocketId } from '@/app/queue-utils/useSocketId'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

type Props = {
  companyId: number
  userChannelName: string
}

const LeaveQueueButton = (props: Props) => {
  const { companyId, userChannelName } = props
  const [isLeaving, startTransition] = useTransition()
  const { isPending: isSocketIdPending, socketId } = useSocketId()

  const isPending = isSocketIdPending || isLeaving

  console.log({ socketId })

  const onLeave = async () => {
    startTransition(async () => {
      if (isSocketIdPending) {
        await new Promise((resolve) => {
          const interval = setInterval(async () => {
            if (!isSocketIdPending) {
              clearInterval(interval)
              resolve('')
            }
          })
        })
      }

      leaveQueue(companyId, socketId!, userChannelName)

      // setIsJoined(false)
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
