import React from 'react'

import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      src="/assets/logo.svg"
      alt="askvirtualhealthcare logo"
      width={158}
      height={48}
    />
  )
}
