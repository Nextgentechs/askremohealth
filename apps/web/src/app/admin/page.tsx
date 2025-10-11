// app/admin/page.tsx  (server component)
import Logo from '@web/components/logo'
import { MobileMenu } from '@web/components/mobile-menu'
import Link from 'next/link'
import AuthClientWrapper from './AuthClientWrapper' // relative import inside app/admin

export default function AdminPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      {/*
        <div className="fixed left-0 right-0 top-0 flex w-full items-center justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
          <div className="flex items-center gap-4">
            <Logo href="/admin" />
            <h2 className="text-lg font-semibold hidden sm:block">Admin Portal...</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden xl:inline-block">Back to Site</Link>
            <MobileMenu />
          </div>
        </div>
        <AuthClientWrapper />  // moved inside app/admin to avoid hydration issues
      */}

     
      redirect('/admin/doctors')
    </div>
  )
}
