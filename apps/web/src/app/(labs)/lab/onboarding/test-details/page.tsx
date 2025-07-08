import Logo from '@web/components/logo'
import Link from 'next/link'
import { Button } from '@web/components/ui/button'
import TestDetailsForm from './_components/test-details-form'

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
      <div className="mx-auto grid min-h-screen content-center py-24">
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex flex-col">
            <p className="text-muted-foreground">
              Please fill in your test details to continue.
            </p>
          </div>
          <TestDetailsForm />
        </div>
      </div>
    </div>
  )
}
