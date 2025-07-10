'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import { AppointmentStatus } from '@web/server/api/validators'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryString } from '../../upcoming-appointments/_components/appointment-tabs'

export const appointmentStatusOptions = Object.values(AppointmentStatus).map(
  (status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status as AppointmentStatus,
  }),
)

export default function AppointmentFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useQueryString()

  return (
    <div className="flex w-full flex-row gap-6">
      <Select
        onValueChange={(value) => {
          if (value === 'all') {
            const params = new URLSearchParams(window.location.search)
            params.delete('status')
            router.push(
              `${pathname}${params.toString() ? `?${params.toString()}` : ''}`,
            )
          } else {
            router.push(pathname + '?' + createQueryString('status', value))
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {appointmentStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
