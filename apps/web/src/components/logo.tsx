import React from 'react'

import Image, { type ImageProps } from 'next/image'

type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export default function Logo({ ...props }: LogoProps) {
  return (
    <Image
      src="/assets/logo.svg"
      alt="askvirtualhealthcare logo"
      width={158}
      height={48}
      {...props}
    />
  )
}
