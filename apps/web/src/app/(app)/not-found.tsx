import { Button } from '@web/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center px-4 pb-20 sm:px-8 md:px-12">
      <Image
        src="/assets/comming-soon.png"
        width={300}
        height={300}
        alt="Coming soon image"
        className="w-full max-w-xs sm:max-w-md md:max-w-lg"
      />
      <h1 className="text-center text-2xl font-bold uppercase text-primary">
        Coming Soon!
      </h1>
      <p className="mt-4 text-center text-base text-gray-600 sm:text-lg md:text-xl">
        This page is currently under development. Check back soon!
      </p>

      <Link href="/" className="mt-12 text-center text-white hover:underline">
        <Button> Go Back Home </Button>
      </Link>
    </div>
  )
}
