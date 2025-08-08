import { type OperatingHours } from '@web/components/doctor-list'
import { clsx, type ClassValue } from 'clsx'

import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTimeSlots(
  opening: string,
  closing: string,
  duration: number,
  bookedSlots: Date[],
  date: Date,
) {
  const slots = []
  const [openHour = 0, openMinute = 0] = opening.split(':').map(Number)
  const [closeHour = 0, closeMinute = 0] = closing.split(':').map(Number)

  let currentHour = openHour
  let currentMinute = openMinute
  const now = new Date()

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    if (currentHour !== 13) {
      const slotTime = new Date(date)
      slotTime.setHours(currentHour, currentMinute, 0, 0)

      const isPastSlot =
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
        time: `${(currentHour > 12 ? currentHour - 12 : currentHour).toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} ${currentHour >= 12 ? 'PM' : 'AM'}`,
        available: !isBooked && !isPastSlot,
      })
    }

    currentMinute += duration + 15
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }

  return slots
}

export function getScheduleForWeek(
  operatingHours: OperatingHours[],
  bookedSlots: Date[],
) {
  const today = new Date()
  const schedule = []

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

export function formatMoney(amount: number | null | undefined) {
  if (!amount) return 'Ksh. 0'

  return `Ksh. ${new Intl.NumberFormat('en-KE').format(amount)}`
}

export function getTimeRange(
  time: string | null,
  duration: number | null | undefined,
) {
  if (!time || !duration) return
  const [start, period] = time.split(' ')
  const [hour, minute] = start?.split(':').map(Number) ?? []

  let endHour = hour
  let endMinute = (minute ?? 0) + duration
  if (endMinute >= 60) {
    endHour = (endHour ?? 0) + Math.floor(endMinute / 60)
    endMinute %= 60
  }

  const endPeriod = (endHour ?? 0) >= 12 ? 'PM' : period

  return {
    start: time,
    end: `${(endHour ?? 0) > 12 ? (endHour ?? 0) - 12 : (endHour ?? 0)}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`,
  }
}

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

export function combineDateTime(dateString: string, timeString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  // Convert time to 24-hour format
  const [hours24, minutes24] = convertTo24Hour(timeString)
    .split(':')
    .map(Number)
  if (hours24 === undefined || minutes24 === undefined) {
    throw new Error('Invalid timeString format')
  }

  // Create a new Date object in UTC
  const combinedDate = new Date(Date.UTC(year, month, day, hours24, minutes24, 0, 0))

  return combinedDate
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    reader.onerror = (error) => reject(error)
  })
}
