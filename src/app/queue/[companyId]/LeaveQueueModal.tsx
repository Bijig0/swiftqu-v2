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

export default function LeaveQueueModal() {
  return (
    <Dialog open={true}>
      <DialogContent className="w-10/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-700" />
          </DialogTitle>
          <DialogDescription className="text-md text-gray-500">
            Are you sure you want to leave the queue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-4">
          <Button className="rounded-md bg-red-700 text-white">
            Yes, I'm sure
          </Button>
          <Button className="rounded-md">No, cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
