import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'

type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export default function Logo({
  href = '/',
  ...props
}: LogoProps & { href?: string }) {
  return (
    <Link href={href}>
      <div className="relative w-[120px] h-[40px] md:w-[158px] md:h-[48px]">
        <Image
          src="/assets/ask-logo.png"
          alt="askvirtualhealthcare logo"
          fill
          className="object-cover"
          {...props}
        />
      </div>
    </Link>
  )
}
