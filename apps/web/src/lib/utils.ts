import { type OperatingHours } from '@web/components/doctor-list'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Client-only function to generate available time slots.
 * Should only be called after mount to avoid SSR mismatch.
 */
export function generateTimeSlots(
  opening: string,
  closing: string,
  duration: number,
  bookedSlots: Date[],
  date: Date,
) {
  const slots: { time: string; available: boolean }[] = []

  const [openHour = 0, openMinute = 0] = opening.split(':').map(Number)
  const [closeHour = 0, closeMinute = 0] = closing.split(':').map(Number)

  let currentHour = openHour
  let currentMinute = openMinute

  const now = typeof window !== 'undefined' ? new Date() : new Date(0)

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    if (currentHour !== 13) {
      const slotTime = new Date(date)
      slotTime.setHours(currentHour, currentMinute, 0, 0)

      const isPastSlot =
        typeof window !== 'undefined' &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        slotTime < now

      const isBooked = bookedSlots.some((bookedSlot) => {
        const bookedTime = new Date(bookedSlot)
        return (
          bookedTime.getFullYear() === slotTime.getFullYear() &&
          bookedTime.getMonth() === slotTime.getMonth() &&
          bookedTime.getDate() === slotTime.getDate() &&
          bookedTime.getHours() === slotTime.getHours() &&
          bookedTime.getMinutes() === slotTime.getMinutes()
        )
      })

      slots.push({
        time: `${(currentHour > 12 ? currentHour - 12 : currentHour)
          .toString()
          .padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} ${
          currentHour >= 12 ? 'PM' : 'AM'
        }`,
        available: !isBooked && !isPastSlot,
      })
    }

    currentMinute += duration + 15
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute %= 60
    }
  }

  return slots
}

/**
 * Get schedule for the week. 
 * Only compute client-side to avoid SSR mismatch.
 */
export function getScheduleForWeek(
  operatingHours: OperatingHours[],
  bookedSlots: Date[],
) {
  if (typeof window === 'undefined') return [] // skip SSR

  const today = new Date()
  const schedule: {
    date: Date
    label?: string
    slots: ReturnType<typeof generateTimeSlots>
  }[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayName = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    const daySchedule = operatingHours[0]?.schedule?.find(
      (d) => d.day.toLowerCase() === dayName,
    )

    if (daySchedule?.isOpen) {
      schedule.push({
        date,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : undefined,
        slots: generateTimeSlots(
          daySchedule.opening ?? '',
          daySchedule.closing ?? '',
          operatingHours[0]?.consultationDuration ?? 30,
          bookedSlots,
          date,
        ),
      })
    }
  }

  return schedule
}

/** SSR-safe money formatter */
export function formatMoney(amount: number | null | undefined) {
  if (!amount) return 'Ksh. 0'
  if (typeof window === 'undefined') return `Ksh. ${amount}`
  return `Ksh. ${new Intl.NumberFormat('en-KE').format(amount)}`
}

/** Converts 12-hour to 24-hour */
export function convertTo24Hour(time: string) {
  const [time12, period] = time.split(' ')
  if (!time12 || !period) throw new Error('Invalid time format')
  const [hours, minutes] = time12.split(':')
  if (!hours || !minutes) throw new Error('Invalid time format')

  let hour24 = parseInt(hours)
  if (period === 'PM' && hour24 !== 12) hour24 += 12
  if (period === 'AM' && hour24 === 12) hour24 = 0

  return `${hour24.toString().padStart(2, '0')}:${minutes}`
}

/** Combines date string and time string to a Date object in Kenya timezone (UTC+3) */
export function combineDateTime(dateString: string, timeString: string) {
  const date = new Date(dateString)
  const [hours24, minutes24] = convertTo24Hour(timeString)
    .split(':')
    .map(Number)
  const kenyaOffset = 3 * 60 // minutes
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours24, minutes24) - kenyaOffset * 60 * 1000)
}

/** Client-only File to Base64 conversion */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
