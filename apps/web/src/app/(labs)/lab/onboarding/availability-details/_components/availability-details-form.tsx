"use client"

import { useState } from "react"
import { Button } from "@web/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card"
import { Label } from "@web/components/ui/label"
import { Switch } from "@web/components/ui/switch"
import { Badge } from "@web/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select"
import { Clock, Calendar, Copy, RotateCcw, Save, CheckCircle2, Plus, Trash2, AlertCircle } from "lucide-react"

// Types based on the schema
export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export interface TimeSlot {
  id: string
  start_time: string
  end_time: string
}

export interface LabAvailability {
  id?: string
  lab_id?: string
  day_of_week: WeekDay
  start_time: string // Format: HH:MM:SS
  end_time: string // Format: HH:MM:SS
}

export interface DayAvailability {
  enabled: boolean
  timeSlots: TimeSlot[]
}

const weekDays: { value: WeekDay; label: string; short: string }[] = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
  { value: "sunday", label: "Sunday", short: "Sun" },
]

const timeSlots = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

const generateId = () => Math.random().toString(36).substr(2, 9)

export default function AvailabilityDetailsForm() {
  const [availability, setAvailability] = useState<Record<WeekDay, DayAvailability>>({
    monday: {
      enabled: true,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }],
    },
    tuesday: {
      enabled: true,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }],
    },
    wednesday: {
      enabled: true,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }],
    },
    thursday: {
      enabled: true,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }],
    },
    friday: {
      enabled: true,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }],
    },
    saturday: {
      enabled: false,
      timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "13:00" }],
    },
    sunday: {
      enabled: false,
      timeSlots: [{ id: generateId(), start_time: "10:00", end_time: "14:00" }],
    },
  })

  const [copyFromDay, setCopyFromDay] = useState<WeekDay>("monday")

  const handleDayToggle = (day: WeekDay, enabled: boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }))
  }

  const handleTimeSlotChange = (day: WeekDay, slotId: string, field: "start_time" | "end_time", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot)),
      },
    }))
  }

  const addTimeSlot = (day: WeekDay) => {
    const newSlot: TimeSlot = {
      id: generateId(),
      start_time: "09:00",
      end_time: "17:00",
    }

    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, newSlot],
      },
    }))
  }

  const removeTimeSlot = (day: WeekDay, slotId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((slot) => slot.id !== slotId),
      },
    }))
  }

  const copyToAllDays = () => {
    const sourceDay = availability[copyFromDay]
    const newAvailability = { ...availability }

    weekDays.forEach(({ value: day }) => {
      if (day !== copyFromDay) {
        newAvailability[day] = {
          ...newAvailability[day],
          timeSlots: sourceDay.timeSlots.map((slot) => ({
            ...slot,
            id: generateId(),
          })),
        }
      }
    })

    setAvailability(newAvailability)
  }

  const copyToWeekdays = () => {
    const sourceDay = availability[copyFromDay]
    const weekdaysList: WeekDay[] = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    const newAvailability = { ...availability }

    weekdaysList.forEach((day) => {
      if (day !== copyFromDay) {
        newAvailability[day] = {
          ...newAvailability[day],
          timeSlots: sourceDay.timeSlots.map((slot) => ({
            ...slot,
            id: generateId(),
          })),
          enabled: true,
        }
      }
    })

    setAvailability(newAvailability)
  }

  const resetToDefaults = () => {
    setAvailability({
      monday: { enabled: true, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }] },
      tuesday: { enabled: true, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }] },
      wednesday: { enabled: true, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }] },
      thursday: { enabled: true, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }] },
      friday: { enabled: true, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "17:00" }] },
      saturday: { enabled: false, timeSlots: [{ id: generateId(), start_time: "09:00", end_time: "13:00" }] },
      sunday: { enabled: false, timeSlots: [{ id: generateId(), start_time: "10:00", end_time: "14:00" }] },
    })
  }

  const handleSubmit = () => {
    // Convert to the format expected by the database
    const labAvailabilityEntries: LabAvailability[] = []

    weekDays.forEach(({ value: day }) => {
      const dayData = availability[day]
      if (dayData.enabled) {
        dayData.timeSlots.forEach((slot) => {
          labAvailabilityEntries.push({
            day_of_week: day,
            start_time: `${slot.start_time}:00`, // Convert to HH:MM:SS format
            end_time: `${slot.end_time}:00`,
          })
        })
      }
    })

    console.log("Lab availability entries:", labAvailabilityEntries)
    // Here you would typically send the data to your server
  }

  const validateTimeSlot = (slot: TimeSlot) => {
    return slot.start_time < slot.end_time
  }

  const checkTimeSlotOverlap = (day: WeekDay) => {
    const dayData = availability[day]
    if (!dayData.enabled || dayData.timeSlots.length < 2) return false

    const sortedSlots = [...dayData.timeSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = sortedSlots[i]
      const nextSlot = sortedSlots[i + 1]
      if (
        currentSlot !== undefined &&
        nextSlot !== undefined &&
        currentSlot.end_time > nextSlot.start_time
      ) {
        return true
      }
    }
    return false
  }

  const isDayValid = (day: WeekDay) => {
    const dayData = availability[day]
    if (!dayData.enabled) return true

    const allSlotsValid = dayData.timeSlots.every(validateTimeSlot)
    const noOverlaps = !checkTimeSlotOverlap(day)

    return allSlotsValid && noOverlaps
  }

  const enabledDaysCount = weekDays.filter(({ value }) => availability[value].enabled).length
  const totalHours = weekDays.reduce((total, { value: day }) => {
    const dayData = availability[day]
    if (!dayData.enabled) return total

    return (
      total +
      dayData.timeSlots.reduce((dayTotal, slot) => {
        const start = new Date(`2000-01-01T${slot.start_time}:00`)
        const end = new Date(`2000-01-01T${slot.end_time}:00`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return dayTotal + hours
      }, 0)
    )
  }, 0)

  const totalTimeSlots = weekDays.reduce((total, { value: day }) => {
    const dayData = availability[day]
    return total + (dayData.enabled ? dayData.timeSlots.length : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Set Your Lab Hours</h1>
          <p className="text-lg text-gray-600">Configure when your lab is available for appointments</p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="secondary" className="text-primary bg-secondary">
              {enabledDaysCount} day{enabledDaysCount !== 1 ? "s" : ""} active
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              {totalTimeSlots} time slot{totalTimeSlots !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              {totalHours.toFixed(1)} hours/week
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Copy className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Copy schedule from:</Label>
                  <Select value={copyFromDay} onValueChange={(value: WeekDay) => setCopyFromDay(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={copyToWeekdays} className="w-full bg-transparent">
                    Copy to Weekdays
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToAllDays} className="w-full bg-transparent">
                    Copy to All Days
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetToDefaults} className="w-full bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weekDays.map(({ value: day, short }) => {
                    const dayData = availability[day]
                    const isValid = isDayValid(day)

                    return (
                      <div key={day} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{short}</span>
                          {!isValid && dayData.enabled && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        {dayData.enabled ? (
                          <div className="space-y-1">
                            {dayData.timeSlots.map((slot, index) => (
                              <div key={slot.id} className="text-xs text-primary pl-2">
                                {slot.start_time} - {slot.end_time}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 pl-2">Closed</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Schedule Configuration */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {weekDays.map(({ value: day, label }) => {
                  const dayData = availability[day]
                  const isValid = isDayValid(day)
                  const hasOverlap = checkTimeSlotOverlap(day)

                  return (
                    <div key={day} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={dayData.enabled}
                            onCheckedChange={(enabled) => handleDayToggle(day, enabled)}
                            className="data-[state=checked]:bg-primary"
                          />
                          <Label className="text-lg font-semibold">{label}</Label>
                          {dayData.enabled && (
                            <Badge variant="outline" className="text-xs">
                              {dayData.timeSlots.length} slot{dayData.timeSlots.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          {!isValid && dayData.enabled && (
                            <Badge variant="destructive" className="text-xs">
                              {hasOverlap ? "Overlapping times" : "Invalid times"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {dayData.enabled && isValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {dayData.enabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(day)}
                              className="bg-transparent"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {dayData.enabled && (
                        <div className="ml-8 space-y-3">
                          {dayData.timeSlots.map((slot, index) => {
                            const isSlotValid = validateTimeSlot(slot)

                            return (
                              <div key={slot.id} className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 flex-1">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="space-y-1">
                                      <Label className="text-sm">Start Time</Label>
                                      <Select
                                        value={slot.start_time}
                                        onValueChange={(value) =>
                                          handleTimeSlotChange(day, slot.id, "start_time", value)
                                        }
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-sm">End Time</Label>
                                      <Select
                                        value={slot.end_time}
                                        onValueChange={(value) => handleTimeSlotChange(day, slot.id, "end_time", value)}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {!isSlotValid && <AlertCircle className="w-4 h-4 text-red-500" />}
                                  {dayData.timeSlots.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeTimeSlot(day, slot.id)}
                                      className="text-red-600 hover:text-red-700 bg-transparent"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {day !== "sunday" && <hr className="border-gray-200" />}
                    </div>
                  )
                })}

                <div className="flex justify-end pt-6">
                  <Button onClick={handleSubmit} className="px-8 py-3 bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Availability Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
