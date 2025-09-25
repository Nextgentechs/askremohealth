'use client'

import AuthForm from '@web/components/auth-form'
import Logo from '@web/components/logo'
import { Button } from '@web/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@web/components/ui/navigation-menu'
import { Home, Info, Stethoscope, FlaskConical, Hospital, BriefcaseMedical, Book } from 'lucide-react'

const navOptions = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'About Us',
    href: '/about-us',
    icon: Info,
  },
  {
    label: 'Consult a Doctor',
    href: '/find-specialists',
    icon: Stethoscope,
  },
  {
    label: 'Lab Tests',
    href: '/laboratories',
    icon: FlaskConical,
  },
  {
    label: 'Blogs',
    href: '/articles',
    icon: Book,
  },
  {
    label: 'Contact Us',
    href: '/contact-us',
    icon: BriefcaseMedical,
  },
]

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed left-0 right-0 top-0 flex w-full items-center justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <div className="flex items-center gap-4">
          <Logo href="https://askremohealth.com/" />
          <NavigationMenu className="hidden list-none gap-1 md:flex">
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
        <Button variant="outline" className="rounded-full" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AuthForm />
      </div>
    </div>
  )
}
