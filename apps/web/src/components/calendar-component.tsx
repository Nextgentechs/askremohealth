"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getScheduleForWeek } from "@web/lib/utils"
import type { OperatingHours } from "./doctor-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { CalendarDays } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { Button } from "./ui/button"

interface CalendarComponentProps {
  doctorId: string
  operatingHours: OperatingHours[]
  bookedSlots: Date[]
}

// Format date as YYYY-MM-DD in local time
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

const getSlotsForDate = (
  date: Date,
  operatingHours: OperatingHours[],
  bookedSlots: Date[]
) => {
  const dayName = getDayName(date)
  const daySchedule = operatingHours[0]?.schedule?.find(
    (d) => d.day.toLowerCase() === dayName
  )
  if (!daySchedule?.isOpen) return []
  return getScheduleForWeek(operatingHours, bookedSlots)
    .find((d) => formatDate(d.date) === formatDate(date))?.slots ?? []
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ doctorId, operatingHours, bookedSlots }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined)
  const router = useRouter()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const selectedDay = new Date(date)
      selectedDay.setHours(0, 0, 0, 0)
      if (selectedDay >= today) {
        setSelectedDate(date)
        setSelectedTime(undefined)
      }
    }
  }

  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  const slots = selectedDate ? getSlotsForDate(selectedDate, operatingHours, bookedSlots) : []

  const handleProceed = () => {
    if (!selectedDate || !selectedTime) return
    const dateStr = formatDate(selectedDate)
    router.push(`/find-specialists/${doctorId}/book?date=${dateStr}&time=${encodeURIComponent(selectedTime)}`)
  }

  return (
    <Card className="w-full flex flex-col shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-[#402E7D] to-[#4A26C2] text-white rounded-t-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CalendarDays className="h-6 w-6" />
          <CardTitle className="text-xl font-semibold">Select a Date</CardTitle>
        </div>
        <CardDescription className="text-[#EBE6FF]">
          First select a date then choose your convenient time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6 w-full flex-1">
        <div className="w-full flex-grow">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-lg border border-[#D9D0FF] shadow-sm bg-white w-full flex-grow"
          />
        </div>
        {selectedDate && (
          <div className="flex flex-col gap-4 w-full">
            <Badge variant="secondary" className="bg-[#F4F2FF] text-[#402E7D] border-[#D9D0FF] hover:bg-[#EBE6FF] w-fit mx-auto">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Badge>
            <div className="flex flex-wrap gap-2 justify-center w-full">
              {slots.length === 0 && (
                <span className="text-muted-foreground text-sm">No available slots for this day</span>
              )}
              {slots.filter(slot => slot.available).map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  className="text-xs px-3 py-1"
                  onClick={() => setSelectedTime(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}
        {selectedDate && selectedTime && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="p-4 bg-gradient-to-r from-[#F4F2FF] to-[#EBE6FF] rounded-lg border border-[#D9D0FF] text-center">
              <p className="font-semibold text-[#402E7D] text-lg">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-[#4A26C2] mt-1">{selectedTime}</p>
            </div>
            <Button onClick={handleProceed} className="w-fit">
              Proceed to Book Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CalendarComponent
