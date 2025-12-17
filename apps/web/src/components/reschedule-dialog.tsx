'use client'

import { Button } from '@web/components/ui/button'
import { Calendar } from '@web/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@web/components/ui/dialog'
import { Label } from '@web/components/ui/label'
import { useToast } from '@web/hooks/use-toast'
import { generateTimeSlots } from '@web/lib/utils'
import { api } from '@web/trpc/react'
import { format, setHours, setMinutes, startOfToday } from 'date-fns'
import { CalendarClock, Check, Loader2, X } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import { useMemo, useState } from 'react'

interface RescheduleDialogProps {
  appointmentId: string
  doctorId: string
  currentDate: Date
  appointmentType: 'online' | 'physical'
}

/**
 * Reschedule Dialog Component
 *
 * Allows patients to reschedule their upcoming appointments.
 * Shows a calendar for date selection and time slot picker based on doctor's availability.
 */
export function RescheduleDialog({
  appointmentId,
  doctorId,
  currentDate,
  appointmentType: _appointmentType,
}: RescheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')

  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  // Fetch doctor details including operating hours and booked slots
  const { data: doctorDetails, isLoading: doctorLoading } =
    api.doctors.details.useQuery(doctorId, {
      enabled: open,
    })

  // Reschedule mutation
  const { mutate: reschedule, isPending } =
    api.users.rescheduleAppointment.useMutation({
      onSuccess: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Appointment rescheduled successfully!</span>
            </div>
          ),
        })
        setOpen(false)
        void utils.users.listAppointments.invalidate()
        router.refresh()
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          description: (
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>{error.message || 'Failed to reschedule appointment'}</span>
            </div>
          ),
        })
      },
    })

  // Generate available slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !doctorDetails?.operatingHours?.[0]) return []

    const dayName = selectedDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    const daySchedule = doctorDetails.operatingHours[0].schedule?.find(
      (d) => d.day.toLowerCase() === dayName,
    )

    if (!daySchedule?.isOpen) return []

    const bookedSlots = (doctorDetails.bookedSlots ?? []).map(
      (slot) => new Date(slot),
    )

    return generateTimeSlots(
      daySchedule.opening ?? '',
      daySchedule.closing ?? '',
      doctorDetails.operatingHours[0].consultationDuration ?? 30,
      bookedSlots,
      selectedDate,
    ).filter((slot) => slot.available)
  }, [selectedDate, doctorDetails])

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        variant: 'destructive',
        description: 'Please select a date and time',
      })
      return
    }

    // Parse the time (e.g., "09:00 AM" -> hours: 9, minutes: 0)
    const timeMatch = /^(\d{2}):(\d{2})\s*(AM|PM)$/i.exec(selectedTime)
    if (!timeMatch) {
      toast({
        variant: 'destructive',
        description: 'Invalid time format',
      })
      return
    }

    let hours = parseInt(timeMatch[1] ?? '0', 10)
    const minutes = parseInt(timeMatch[2] ?? '0', 10)
    const period = timeMatch[3]?.toUpperCase()

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }

    const newDate = setMinutes(setHours(selectedDate, hours), minutes)

    reschedule({
      appointmentId,
      newDate,
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedDate(undefined)
      setSelectedTime('')
    }
  }

  // Check if a date has available slots
  const isDateDisabled = (date: Date) => {
    if (date < startOfToday()) return true
    if (!doctorDetails?.operatingHours?.[0]) return true

    const dayName = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    const daySchedule = doctorDetails.operatingHours[0].schedule?.find(
      (d) => d.day.toLowerCase() === dayName,
    )

    return !daySchedule?.isOpen
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary">
          <CalendarClock className="size-4" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Current appointment: {format(currentDate, 'EEEE, MMMM d, yyyy')} at{' '}
            {format(currentDate, 'h:mm a')}
          </DialogDescription>
        </DialogHeader>

        {doctorLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select New Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label>Select Time</Label>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No available slots on this date. Please select another date.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        type="button"
                        size="sm"
                        variant={
                          selectedTime === slot.time ? 'default' : 'outline'
                        }
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Confirm Reschedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
