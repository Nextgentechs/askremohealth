import { ReactNode } from '@tanstack/react-router'
import React, { createContext } from 'react'
import { RouterInputs } from '@/lib/trpc'

type SignupSchema = RouterInputs['auth']['doctorSignup']

type AuthContext = {
  formData: SignupSchema
  updateFormData: (data: Partial<SignupSchema>) => void
  currentStep: number
  nextStep: () => void
  prevStep: () => void
}

export const initialOperatingHours: SignupSchema['operatingHours'] = [
  { day: 'Monday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Tuesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Wednesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Thursday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Friday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Saturday', opening: '09:00', closing: '13:00', isOpen: true },
  { day: 'Sunday', opening: '00:00', closing: '00:00', isOpen: false },
]

const initialState: SignupSchema = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dob: '',
  bio: '',
  phone: '',
  specialty: '',
  experience: '0',
  facility: '',
  registrationNumber: '',
  subSpecialty: [],
  appointmentDuration: '30',
  operatingHours: initialOperatingHours,
}

export const AuthContext = createContext<AuthContext>({
  formData: initialState,
  updateFormData: () => {},
  currentStep: 1,
  nextStep: () => {},
  prevStep: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = React.useState<SignupSchema>(initialState)
  const [currentStep, setCurrentStep] = React.useState(1)

  const updateFormData = (data: Partial<SignupSchema>) => {
    setFormData({ ...formData, ...data })
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <AuthContext.Provider
      value={{ formData, updateFormData, currentStep, nextStep, prevStep }}
    >
      {children}
    </AuthContext.Provider>
  )
}
