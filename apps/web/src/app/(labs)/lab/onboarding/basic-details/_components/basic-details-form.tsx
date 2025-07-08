'use client'

import type React from 'react'

import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { Building2, CheckCircle, Globe, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function BasicDetailsForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    county: '',
    town: '',
    phone: '',
    website: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your server
  }

  const isStep1Valid = formData.name.trim() !== ''
  const isStep2Valid =
    formData.address.trim() !== '' &&
    formData.county.trim() !== '' &&
    formData.town.trim() !== ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">
              Step {currentStep} of 3
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              {currentStep === 1 && 'Lab Information'}
              {currentStep === 2 && 'Location Details'}
              {currentStep === 3 && 'Contact Information'}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {currentStep === 1 &&
                "Let's start with your lab's basic information"}
              {currentStep === 2 && 'Tell us where your lab is located'}
              {currentStep === 3 &&
                'Add your contact details to complete setup'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-base font-semibold text-gray-700"
                    >
                      Lab Name *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your lab name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        className="pl-10 h-12 text-base border-2 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-base font-semibold text-gray-700"
                    >
                      Street Address *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className="pl-10 h-12 text-base border-2 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="town"
                        className="text-base font-semibold text-gray-700"
                      >
                        Town/City *
                      </Label>
                      <Input
                        id="town"
                        type="text"
                        placeholder="Enter town or city"
                        value={formData.town}
                        onChange={(e) =>
                          handleInputChange('town', e.target.value)
                        }
                        className="h-12 text-base border-2 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="county"
                        className="text-base font-semibold text-gray-700"
                      >
                        County *
                      </Label>
                      <Input
                        id="county"
                        type="text"
                        placeholder="Enter county"
                        value={formData.county}
                        onChange={(e) =>
                          handleInputChange('county', e.target.value)
                        }
                        className="h-12 text-base border-2 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-base font-semibold text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className="pl-10 h-12 text-base border-2 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="text-base font-semibold text-gray-700"
                    >
                      Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.yourlab.com"
                        value={formData.website}
                        onChange={(e) =>
                          handleInputChange('website', e.target.value)
                        }
                        className="pl-10 h-12 text-base border-2 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-8 p-6 bg-secondary rounded-lg border-2 border-primary/20">
                    <h3 className="font-semibold text-primary mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Review Your Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Lab Name:</span>{' '}
                        {formData.name}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        {formData.address}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{' '}
                        {formData.town}, {formData.county}
                      </p>
                      {formData.phone && (
                        <p>
                          <span className="font-medium">Phone:</span>{' '}
                          {formData.phone}
                        </p>
                      )}
                      {formData.website && (
                        <p>
                          <span className="font-medium">Website:</span>{' '}
                          {formData.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-8 py-3 text-base border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 bg-transparent"
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !isStep1Valid) ||
                      (currentStep === 2 && !isStep2Valid)
                    }
                    className="px-8 py-3 text-base bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Link href="/lab/onboarding/test-details">
                    <Button className="px-8 py-3 text-base bg-primary hover:bg-primary/90">
                      Complete Setup
                    </Button>
                  </Link>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
