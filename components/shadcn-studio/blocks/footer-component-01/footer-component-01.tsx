"use client";

import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Logo from '@/components/shadcn-studio/logo'
import { useSearchParams } from 'next/navigation'

const Footer = () => {
  const searchParams = useSearchParams()
  const currentGroupId = searchParams.get("group") ?? "MPLID"

  const createUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("group", currentGroupId)
    return `${base}?${params.toString()}`
  }

  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <Link href='/'>
          <div className='flex items-center gap-3'>
            <Logo className='gap-3' />
            <span className='text-xl font-black tracking-tight'>MPL<span className="text-primary tracking-normal">Tracker</span></span>
          </div>
        </Link>

        <div className='flex flex-wrap items-center justify-center gap-5 whitespace-nowrap text-sm font-medium'>
          <Link href={createUrl('/dashboard')} className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Dashboard
          </Link>
          <Link href={createUrl('/schedule')} className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Match Schedule
          </Link>
          <Link href={createUrl('/standing')} className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Standings
          </Link>
          <Link href={createUrl('/prediction')} className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Predictions
          </Link>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
        <p className='text-center font-medium text-muted-foreground text-balance'>
          {`© ${new Date().getFullYear()}`}{' '}
          <Link href='/' className='hover:underline text-foreground'>
            MPL Tracker
          </Link>
          . The ultimate esports prediction tool.
        </p>
      </div>
    </footer>
  )
}

export default Footer
