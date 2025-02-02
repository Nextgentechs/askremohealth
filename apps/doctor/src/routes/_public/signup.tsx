import { AuthContext } from '@/context/auth-context'
import { createFileRoute } from '@tanstack/react-router'
import { useContext } from 'react'
import PersonalDetails from '@/components/auth/personal-details'
import ProffesionalDetails from '@/components/auth/professional-details'
import AvailabilityDetails from '@/components/auth/availability-details'

export const Route = createFileRoute('/_public/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const { currentStep } = useContext(AuthContext)

  return (
    <div className="m-auto w-full">
      {currentStep === 1 && <PersonalDetails />}
      {currentStep === 2 && <ProffesionalDetails />}
      {currentStep === 3 && <AvailabilityDetails />}
    </div>
  )
}
