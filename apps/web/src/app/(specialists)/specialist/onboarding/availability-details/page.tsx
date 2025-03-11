import Logo from '@web/components/logo'
import AvailabilityDetailsForm from './_components/availability-details-form'

export default function page() {
  return (
    <div className="flex flex-col">
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/home" />
      </div>
      <div className="mx-auto grid min-h-screen content-center px-6 py-24 sm:px-8 sm:py-28">
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-medium sm:text-2xl">
              Availability Details
            </h1>
            <p className="text-muted-foreground">
              Please fill in your availability details and consultation fee.
            </p>
          </div>
          <AvailabilityDetailsForm />
        </div>
      </div>
    </div>
  )
}
