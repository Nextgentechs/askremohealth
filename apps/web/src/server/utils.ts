import { redisClient } from "@web/redis/redis"
import { User } from "./db/schema"

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  MISSED = 'missed',
  IN_PROGRESS = 'in_progress',
}

export function convertTo24Hour(time: string) {
  const [timeStr, period] = time.split(' ')
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = timeStr?.split(':').map(Number) ?? []
  if (period === 'PM' && hours !== undefined && hours !== 12) {
    hours += 12
  }
  if (period === 'AM' && hours === 12) {
    hours = 0
  }

  if (hours === undefined || minutes === undefined) {
    throw new Error('Invalid time format')
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}


export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const userData = await redisClient.get(`session:${token}`)

    if (!userData || typeof userData !== 'string') return null

    const user = JSON.parse(userData) as User
    return user
  } catch (err) {
    console.error('Failed to get user from token:', err)
    return null
  }
}
