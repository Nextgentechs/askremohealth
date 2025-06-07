'use client'

import Link from 'next/link'
import React from 'react'
import { Facebook, Instagram, Twitter, YouTube } from './icons'
import Logo from './logo'

const footerNavOptions = {
  patients: [
    {
      header: 'For Patients',
      links: [
        { title: 'Account Signup', href: '/auth?role=patient' },
        { title: 'Login', href: '/auth?role=patient' },
        { title: 'Doctors', href: '/find-specialists' },
        { title: 'Hospitals', href: '/hospitals' },
        { title: 'Laboratories', href: '/laboratories' },
        { title: 'Pharmacies', href: '/pharmacies' },
        { title: 'FAQ', href: '/faq' },
      ],
    },
  ],

  doctors: [
    {
      header: 'For Specialists',
      links: [
        { title: 'Register your practice', href: '/register-facility' },
        { title: 'FAQ', href: '/faq' },
      ],
    },
  ],

  facilities: [
    {
      header: 'For Healthcare Facilities',
      links: [
        { title: 'Register your facility', href: '/register-facility' },
        { title: 'FAQ', href: '/faq' },
      ],
    },
  ],

  ourCompany: [
    {
      header: 'Our Company',
      links: [
        { title: 'About Us', href: '/about-us' },
        { title: 'Contact Us', href: '/contact-us' },
        { title: 'Terms of Service', href: '/terms-of-service' },
        { title: 'Privacy Policy', href: '/privacy-policy' },
      ],
    },
  ],
}

function SocialIcon({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex size-7 sm:size-10 items-center justify-center rounded-full hover:bg-accent"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: 'size-5 sm:size-6',
      })}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-gradient-to-b from-white to-secondary py-16">
      <div className="container grid grid-cols-2 justify-between gap-4 gap-y-6 md:grid-cols-4 lg:grid-cols-5">
        <div className="flex flex-col items-start gap-8">
          <Logo />

          <div className="flex flex-row gap-1 sm:gap-2 border-y border-border py-4">
            <SocialIcon
              href="https://facebook.com"
              icon={<Facebook />}
              label="Facebook"
            />
            <SocialIcon
              href="https://twitter.com"
              icon={<Twitter />}
              label="Twitter"
            />
            <SocialIcon
              href="https://instagram.com"
              icon={<Instagram />}
              label="Instagram"
            />
            <SocialIcon
              href="https://youtube.com"
              icon={<YouTube />}
              label="YouTube"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Askremohealth
          </div>
        </div>

        {Object.entries(footerNavOptions).map(
          ([categoryKey, categoryValue]) => (
            <div key={categoryKey} className="flex flex-col justify-between">
              {categoryValue.map((category, index) => (
                <div key={index} className="flex flex-col">
                  <h3 className="mb-2 text-lg font-semibold text-primary">
                    {category.header}
                  </h3>
                  {category.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="mb-1 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </footer>
  )
}
