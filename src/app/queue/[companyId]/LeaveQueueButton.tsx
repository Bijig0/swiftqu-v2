'use client'
import { Button } from '@/components/ui/button'

type Props = {
  onClick: () => void
}

const LeaveQueueButton = (props: Props) => {
  const { onClick } = props
  return (
    <Button
      type="button"
      className="flex-1 bg-red-700 hover:bg-red-800"
      size="lg"
      onClick={onClick}
    >
      Leave Queue
    </Button>
  )
}

export default LeaveQueueButton
