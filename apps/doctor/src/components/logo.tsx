import React from 'react'
import logo from '@/assets/logo.svg'

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement>

export default function Logo({ ...props }: LogoProps) {
  return (
    <img
      src={logo}
      alt="askvirtualhealthcare logo"
      width={158}
      height={48}
      {...props}
    />
  )
}
