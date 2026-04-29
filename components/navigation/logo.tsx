import { Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex bg-primary text-primary-foreground p-1.5 rounded-md group-hover:bg-primary/90 transition-colors">
        <Swords className='size-5' />
      </div>
    </div>
  )
}

export default Logo
