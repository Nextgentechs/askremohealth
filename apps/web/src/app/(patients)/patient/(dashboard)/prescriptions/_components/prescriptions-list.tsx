'use client'

import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@web/components/ui/collapsible'
import { Skeleton } from '@web/components/ui/skeleton'
import { api } from '@web/trpc/react'
import { format } from 'date-fns'
import {
  Calendar,
  ChevronDown,
  FileText,
  Pill,
  Stethoscope,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  dispensed: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
} as const

export function PrescriptionsList() {
  const { data: prescriptions, isLoading } =
    api.prescriptions.getMyPrescriptions.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="size-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No prescriptions yet</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Your prescriptions will appear here after your appointments with
            doctors.
          </p>
          <Button asChild className="mt-4">
            <Link href="/find-specialists">Find a Specialist</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <PrescriptionCard
          key={prescription.id}
          prescription={prescription as PrescriptionCardProps['prescription']}
        />
      ))}
    </div>
  )
}

interface PrescriptionCardProps {
  prescription: {
    id: string
    diagnosis: string | null
    notes: string | null
    status: 'active' | 'dispensed' | 'expired' | 'cancelled'
    validUntil: Date | null
    createdAt: Date
    appointmentDate: Date
    doctor: {
      id: string
      firstName: string
      lastName: string
    }
    items: Array<{
      id: string
      medicationName: string
      dosage: string
      frequency: string
      duration: string
      quantity: number | null
      instructions: string | null
    }>
  }
}

function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="size-5 text-primary" />
                  Dr. {prescription.doctor.firstName}{' '}
                  {prescription.doctor.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {format(new Date(prescription.appointmentDate), 'PPP')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[prescription.status]}>
                  {prescription.status.charAt(0).toUpperCase() +
                    prescription.status.slice(1)}
                </Badge>
                <ChevronDown
                  className={`size-5 text-muted-foreground transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 border-t pt-4">
            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground">
                  Diagnosis
                </h4>
                <p>{prescription.diagnosis}</p>
              </div>
            )}

            {/* Medications */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-medium text-muted-foreground">
                <Pill className="size-4" />
                Medications ({prescription.items.length})
              </h4>
              <div className="space-y-3">
                {prescription.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h5 className="font-semibold">{item.medicationName}</h5>
                      {item.quantity && (
                        <Badge variant="outline">Qty: {item.quantity}</Badge>
                      )}
                    </div>
                    <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground">Dosage:</span>{' '}
                        {item.dosage}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Frequency:
                        </span>{' '}
                        {item.frequency}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{' '}
                        {item.duration}
                      </div>
                    </div>
                    {item.instructions && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Instructions:</span>{' '}
                        {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground">
                  Additional Notes
                </h4>
                <p className="text-sm">{prescription.notes}</p>
              </div>
            )}

            {/* Valid Until */}
            {prescription.validUntil && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                Valid until: {format(new Date(prescription.validUntil), 'PPP')}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
