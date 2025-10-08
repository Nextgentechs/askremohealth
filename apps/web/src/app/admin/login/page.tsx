'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@web/components/auth-form'
import Logo from '@web/components/logo'
import { MobileMenu } from '@web/components/mobile-menu'
import { Button } from '@web/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@web/components/ui/navigation-menu'
import { Home, Info, Stethoscope, FlaskConical, Book, BriefcaseMedical } from 'lucide-react'
import Link from 'next/link'


const navOptions = [
  { label: 'Home', href: 'https://staging.askremohealth.com/', icon: Home },
  { label: 'About Us', href: 'https://staging.askremohealth.com/about-us', icon: Info },
  { label: 'Consult a Doctor', href: 'https://staging.askremohealth.com/find-specialists', icon: Stethoscope },
  { label: 'Lab Tests', href: 'https://staging.askremohealth.com/laboratories', icon: FlaskConical },
  { label: 'Blogs', href: 'https://staging.askremohealth.com/articles', icon: Book },
  { label: 'Contact Us', href: 'https://staging.askremohealth.com/contact-us', icon: BriefcaseMedical },
]

export default function AdminLoginPage() {
  const router = useRouter()  
  
 
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed left-0 right-0 top-0 flex w-full items-center justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <div className="flex items-center justify-center gap-4">
          <Logo href="https://staging.askremohealth.com/" />
          <NavigationMenu className="hidden list-none gap-1 xl:flex">
            {navOptions.map((option) => (
              <NavigationMenuItem key={option.label}>
                <Link href={option.href ?? '#'}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <span>{option.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full hidden xl:flex" onClick={() => router.back()}>Back</Button>
          <MobileMenu />
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <h2 className="text-2xl font-semibold">Admin Sign in</h2>
        <AuthForm />        
        <div className="flex justify-between items-center mt-4">
          <Link href="/admin/signup" className="underline text-sm">Create admin account</Link>
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
      </div>
    </div>
  )
}
