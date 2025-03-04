import React from 'react'
import Logo from '@web/components/logo'
import ProfessionalDetailsForm from './_components/professional-details-form'

export default function page() {
  return (
    <div className="flex flex-col">
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/home" />
      </div>
      <div className="mx-auto grid min-h-screen content-center px-6 py-24 sm:px-8 sm:py-28">
        <div className="flex max-w-2xl flex-col gap-8 sm:gap-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium sm:text-3xl">
              Professional Details
            </h1>
            <p className="text-muted-foreground">
              Please fill in your professional details to continue.
            </p>
          </div>
          <ProfessionalDetailsForm />
        </div>
      </div>
    </div>
  )
}
