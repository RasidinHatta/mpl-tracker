import Image from 'next/image'
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex size-8 overflow-hidden rounded-md bg-background ring-1 ring-border transition-colors group-hover:ring-primary/50">
        <Image
          src="/mpl-tracker-logo.png"
          alt="MPL Tracker logo"
          width={32}
          height={32}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  )
}

export default Logo
