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
import { Building2, Phone } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BasicDetailsForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your server
    router.push('/lab/onboarding/test-details')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Lab Information
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Enter your lab&apos;s name and phone number.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" className="px-8 py-3 text-lg">
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
