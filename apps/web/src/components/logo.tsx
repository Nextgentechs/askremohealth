import React from 'react'

import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'

type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export default function Logo({
  href = '/',
  ...props
}: LogoProps & { href?: string }) {
  return (
    <Link href={href}>
      <Image
        src="/assets/logo.svg"
        alt="askvirtualhealthcare logo"
        width={158}
        height={48}
        {...props}
      />
    </Link>
  )
}
