'use client'
import { useSocketId } from '@/app/queue-utils/useSocketId'
import { useState, useTransition } from 'react'
import LeaveQueueButton from './LeaveQueueButton'
import LeaveQueueModal from './LeaveQueueModal'
import leaveQueue from './leaveQueue'
type Props = {
  companyId: number
  userChannelName: string
}
const LeaveQueueManager = (props: Props) => {
  const { companyId, userChannelName } = props
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const [isLeaving, startTransition] = useTransition()
  const { isPending: isSocketIdPending, socketId } = useSocketId()

  const isPending = isSocketIdPending || isLeaving

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
    <>
      <LeaveQueueButton onClick={openModal} />
      <LeaveQueueModal
        onLeave={onLeave}
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </>
  )
}

export default LeaveQueueManager
