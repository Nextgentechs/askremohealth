'use client'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'

type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export default function Logo({
  href = 'https://askremohealth.com/',
  ...props
}: LogoProps & { href?: string }) {
  return (
    <Link href={href}>
      <div className="relative w-[120px] h-[40px] md:w-[158px] md:h-[48px]" suppressHydrationWarning={true}>
        <Image
          src="/assets/ask-logo.png"
          alt="askvirtualhealthcare logo"
          fill
          className="object-cover"
          priority // ✅ Add this line
          {...props}
        />
      </div>
    </Link>
  )
}
