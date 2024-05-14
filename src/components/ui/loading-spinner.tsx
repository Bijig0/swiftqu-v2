import { cn } from '@/utils/tailwind'
import { Loader2 } from 'lucide-react'

const Loader = ({ className }: { className?: string }) => {
  return (
    <Loader2
      className={cn('h-16 w-16 animate-spin text-primary/60', className)}
    />
  )
}

export default Loader
