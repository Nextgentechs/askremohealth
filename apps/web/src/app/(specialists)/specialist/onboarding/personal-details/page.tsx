import Logo from '@web/components/logo'
import { Button } from '@web/components/ui/button'
import PersonalDetailsForm from './_components/personal-details-form'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="flex flex-col">
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/home" />
        <Button variant="outline" className="rounded-full">
          Back
        </Button>
      </div>
      <div className="mx-auto grid min-h-screen content-center px-6 py-24 sm:px-8 sm:py-28">
        <div className="flex max-w-2xl flex-col gap-8 sm:gap-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium sm:text-3xl">
              Personal Details
            </h1>
            <p className="text-muted-foreground">
              Please fill in your personal details to continue.
            </p>
          </div>
          <PersonalDetailsForm />
        </div>
      </div>
    </div>
  )
}
