'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card'
import { api } from '@web/trpc/react'
import { Building2, GraduationCap, UserRound } from 'lucide-react'
import React from 'react'

type SubSpecialty = {
  id: string
  name: string
}

export default function ProfessionalInfo() {
  const [doctor] = api.doctors.currentDoctor.useSuspenseQuery()
  const { data: subspecialties } = api.specialties.listSubSpecialties.useQuery({
    specialityId: doctor?.specialty?.id ?? '',
  })

  const selectedSubSpecialties = subspecialties?.filter((sub: SubSpecialty) =>
    doctor?.subSpecialties?.some((doctorSub) => doctorSub.id === sub.id)
  )

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-medium">Specialty</h3>
              <p className="text-muted-foreground">
                {doctor?.specialty?.name ?? 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserRound className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-medium">Sub-specialties</h3>
              <p className="text-muted-foreground">
                {selectedSubSpecialties?.map((sub) => sub.name).join(', ') ??
                  'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-medium">Years of Experience</h3>
              <p className="text-muted-foreground">
                {doctor?.experience ?? 'Not specified'} years
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserRound className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-medium">Medical Registration Number</h3>
              <p className="text-muted-foreground">
                {doctor?.licenseNumber ?? 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-medium">Facility</h3>
              <p className="text-muted-foreground">
                {doctor?.facility?.name ?? 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
