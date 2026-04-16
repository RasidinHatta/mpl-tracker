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
          <Link href='/about' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            About
          </Link>
          <Link href='/features' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Features
          </Link>
          <Link href='/terms' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Terms
          </Link>
          <Link href='/privacy' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Privacy
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
          . Empowering your financial future.
        </p>
      </div>
    </footer>
  )
}

export default Footer
