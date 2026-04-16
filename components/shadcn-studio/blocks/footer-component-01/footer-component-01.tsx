import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Logo from '@/components/shadcn-studio/logo'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <a href='/'>
          <div className='flex items-center gap-3'>
            <Logo className='gap-3' />
          </div>
        </a>

        <div className='flex flex-wrap items-center justify-center gap-5 whitespace-nowrap text-sm font-medium'>
          <Link href='/' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Dashboard
          </Link>
          <Link href='/schedule' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Match Schedule
          </Link>
          <Link href='/standing' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Standings
          </Link>
          <Link href='/prediction' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
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
