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
) {
  const slots = []
  const [openHour = 0, openMinute = 0] = opening.split(':').map(Number)
  const [closeHour = 0, closeMinute = 0] = closing.split(':').map(Number)

  let currentHour = openHour
  let currentMinute = openMinute

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    if (currentHour !== 13) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

      const slotTime = new Date()
      slotTime.setHours(currentHour, currentMinute, 0, 0)
      const isBooked = bookedSlots.some(
        (bookedSlot) => bookedSlot.getTime() === slotTime.getTime(),
      )

      slots.push({
        time: `${timeString} ${currentHour >= 12 ? 'PM' : 'AM'}`,
        available: !isBooked,
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

export function getScheduleForWeek(operatingHours: OperatingHours[]) {
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
          [],
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

export function combineDateTime(date: string, time: string) {
  const baseDate = new Date(date)

  const [hours, minutes] = convertTo24Hour(time).split(':')
  if (!hours || !minutes) throw new Error('Invalid time format')

  baseDate.setHours(parseInt(hours))
  baseDate.setMinutes(parseInt(minutes))
  baseDate.setSeconds(0)
  baseDate.setMilliseconds(0)

  return baseDate
}
