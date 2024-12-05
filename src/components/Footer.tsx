'use client'

import React from 'react'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Logo from './logo'
import Link from 'next/link'
const currentYear: number = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-white to-secondary px-16 py-[60px] text-muted-foreground sm:px-8 md:h-[463px] md:overflow-hidden md:px-12 lg:px-16">
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col items-start">
          <div className="mb-6">
            <Logo />
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-xl">
              <Facebook />
            </Link>
            <Link href="#" className="text-xl">
              <Twitter />
            </Link>
            <Link href="#" className="text-xl">
              <Instagram />
            </Link>
            <Link href="#" className="text-xl">
              <Youtube />
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-md">&copy; {currentYear}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="text-xl font-bold text-primary">For Patients</h4>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="#" className="text-muted-foreground">
                Account Signup/Login
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Hospitals and Clinics
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Laboratories
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Drug Stores
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Home care
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="text-xl font-bold text-primary">For Doctors</h4>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="#" className="text-muted-foreground">
                Account Signup/Login
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                How to register
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Promote your practice
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Help center
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="text-xl font-bold text-primary">
            For Healthcare Facilities
          </h4>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="#" className="text-muted-foreground">
                Account Signup/Login
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                How to register
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Promote your practice
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Help center
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="text-xl font-bold text-primary">Our Company</h4>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="#" className="text-muted-foreground">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground">
                Careers
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="absolute -bottom-3 left-[163px] top-[166px] z-0 h-[274px] w-[270px] rounded-full bg-gradient-to-br from-white to-secondary"></div>
      <div className="absolute -bottom-3 left-[1201px] top-[256px] z-0 h-[274px] w-[270px] rounded-full bg-gradient-to-br from-white to-secondary"></div>
    </footer>
  )
}
