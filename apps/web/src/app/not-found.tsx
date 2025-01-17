'use client'
import { Button } from '@web/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ComingSoonRoutes = [
  '/hospitals',
  '/pharmacies',
  '/faq',
  '/laboratories',
  '/how-to-register',
  '/promote-your-practice',
  '/promote-your-facility',
  '/about-us',
  '/contact-us',
  '/terms-of-service',
  '/privacy-policy',
  '/health-articles',
]

export default function NotFound() {
  const pathname = usePathname()
  const isComingSoon = ComingSoonRoutes.includes(pathname)

  return (
    <div className="flex h-[55vh] flex-col items-center justify-center bg-[#f5f3ffa2] px-4 sm:px-8 md:px-12">
      {isComingSoon ? (
        <>
          <Image
            src="/assets/comming-soon.png"
            width={300}
            height={300}
            alt="Coming soon image"
            className="w-full max-w-xs sm:max-w-md md:max-w-lg"
          />
          <h1 className="text-center text-3xl font-bold uppercase text-primary sm:text-4xl md:text-5xl">
            Coming Soon!
          </h1>
          <p className="mt-4 text-center text-base text-gray-600 sm:text-lg md:text-xl">
            This page is currently under development. Check back soon!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-5xl font-extrabold text-primary sm:text-6xl md:text-7xl">
            404
          </h1>
          <p className="mt-3 text-center text-3xl font-bold text-primary sm:text-4xl md:text-5xl">
            Page Not Found
          </p>
          <p className="mt-4 text-center text-lg text-gray-600 sm:text-xl md:text-2xl">
            {"Sorry, we couldn't find the page you are looking for"}
          </p>
        </>
      )}
      <Link href="/" className="mt-12 text-center text-white hover:underline">
        <Button> Go Back to Home </Button>
      </Link>
    </div>
  )
}
