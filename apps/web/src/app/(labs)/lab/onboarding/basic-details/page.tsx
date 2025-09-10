import Logo from '@web/components/logo'
import { Button } from '@web/components/ui/button'
import Link from 'next/link'
import BasicDetailsForm from './_components/basic-details-form'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="flex flex-col">
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/" />
        <Link href="/">
          <Button variant="outline" className="rounded-full">
            Back
          </Button>
        </Link>
      </div>
      <div className="mx-auto grid min-h-screen content-center px-6 py-16 sm:px-8 sm:py-16">
        <div className="flex max-w-5xl flex-col gap-4 sm:gap-8">
          <div className="flex flex-col"></div>
          <BasicDetailsForm />
        </div>
      </div>
    </div>
  )
}
