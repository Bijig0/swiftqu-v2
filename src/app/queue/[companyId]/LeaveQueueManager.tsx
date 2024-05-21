'use client'
import LeaveQueueButton from './LeaveQueueButton'
import LeaveQueueModal from './LeaveQueueModal'
type Props = {
  companyId: number
  userChannelName: string
}
const LeaveQueueManager = (props: Props) => {
  const { companyId, userChannelName } = props
  return (
    <>
      <LeaveQueueButton
        companyId={companyId}
        userChannelName={userChannelName}
      />
      <LeaveQueueModal />
    </>
  )
}

export default LeaveQueueManager
