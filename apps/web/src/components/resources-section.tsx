'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'

export default function ResourcesSection() {
  return (
    <section className="bg-gray-50 container mx-auto flex w-full flex-col items-center justify-center gap-10 py-16">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
        <h2 className="section-title text-center">List your Laboratory, Hospital or Clinic!</h2>
        <p className="section-description text-center">
          Distinguish your healthcare brand with our strategic approach
        </p>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-gray-700">
              Seamlessly connect with your target patient demographic,
              establishing meaningful and direct engagement. Our tailored
              solutions empower medical practitioners like you to not only
              attract but also retain a growing patient base. By leveraging our
              expertise, enhance your brand visibility and credibility, ensuring
              sustained success in the dynamic healthcare landscape. Let us
              partner in your journey to acquire, retain, and engage more
              patients, shaping a lasting impact in the realm of healthcare
              services. Your success is at the heart of our commitment.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-md">
            <Image
              src="/assets/healthcare-marketing.jpg"
              alt="Healthcare digital marketing illustration showing medical professionals with digital interfaces"
              width={500}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            className="text-white font-medium px-8 py-2 rounded-md"
          >
            <Link href="/auth">Register as a Doctor</Link>
          </Button>
          <Button
            asChild
            className="text-white font-medium px-8 py-2 rounded-md"
          >
            <Link href="/auth">Register Facility</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
