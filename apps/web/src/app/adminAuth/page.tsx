'use client'

import AdminAuthForm from '@web/components/adminAuth-form'
import Logo from '@web/components/logo'
import { MobileMenu } from '@web/components/mobile-menu' // Import MobileMenu
import { Button } from '@web/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@web/components/ui/navigation-menu'
import {
  Home,
  Info,
  Stethoscope,
  FlaskConical,
  Book,
  BriefcaseMedical,
} from 'lucide-react' // Keep only necessary icons for navOptions
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const navOptions = [
  {
    label: 'Home',
    href: 'https://askremohealth.com/',
    icon: Home,
  },
  {
    label: 'About Us',
    href: 'https://askremohealth.com/about-us',
    icon: Info,
  },
  {
    label: 'Consult a Doctor',
    href: 'https://askremohealth.com/find-specialists',
    icon: Stethoscope,
  },
  {
    label: 'Lab Tests',
    href: 'https://askremohealth.com/laboratories',
    icon: FlaskConical,
  },
  {
    label: 'Blogs',
    href: 'https://askremohealth.com/articles',
    icon: Book,
  },
  {
    label: 'Contact Us',
    href: 'https://askremohealth.com/contact-us',
    icon: BriefcaseMedical,
  },
]

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed left-0 right-0 top-0 flex w-full items-center justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <div className="flex items-center justify-center gap-4">
          <Logo href="https://askremohealth.com/" />
          <NavigationMenu className="hidden list-none gap-1 xl:flex">
            {' '}
            {/* Adjusted for responsiveness */}
            {navOptions.map((option) => (
              <NavigationMenuItem key={option.label}>
                <Link href={option.href ?? '#'}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <span>{option.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          {' '}
          {/* Group back button and mobile menu */}
          <Button
            variant="outline"
            className="rounded-full hidden xl:flex"
            onClick={() => router.push('/')}
          >
            {' '}
            {/* Hide on mobile */}
            Back 
          </Button>
          <MobileMenu /> {/* Add MobileMenu component */}
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AdminAuthForm />
      </div>
    </div>
  )
}
