import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

type Props = {
  closeModal: () => void
  isOpen: boolean
  onLeave: () => void
}

export default function LeaveQueueModal(props: Props) {
  const { closeModal, isOpen, onLeave } = props
  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-10/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <HiOutlineExclamationCircle className="text-red-700 text-7xl" />
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-md">
            Are you sure you want to leave the queue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-4">
          <Button className="text-white bg-red-700 rounded-md">
            Yes, I'm sure
          </Button>
          <Button className="rounded-md">No, cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
