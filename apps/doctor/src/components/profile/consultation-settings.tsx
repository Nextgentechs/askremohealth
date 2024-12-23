import { useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'

function OnlineStatus() {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h4 className="text-sm">Online consultation status</h4>
        <p className="text-xs text-green-500">Available</p>
      </div>
      <Switch checked />
    </div>
  )
}

function PhysicalStatus() {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h4 className="text-sm">Physical consultation status</h4>
        <p className="text-xs text-red-500">Unavailable</p>
      </div>
      <Switch checked />
    </div>
  )
}

const operatingHours = [
  { day: 'Monday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Tuesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Wednesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Thursday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Friday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Saturday', opening: '09:00', closing: '13:00', isOpen: true },
  { day: 'Sunday', opening: '00:00', closing: '00:00', isOpen: false },
]

function OperatingHours() {
  const [editingDay, setEditingDay] = useState<string | null>(null)

  const handleEdit = (day: string) => {
    setEditingDay(day === editingDay ? null : day)
  }

  const handleChange = (
    dayIndex: number,
    field: 'opening' | 'closing' | 'isOpen',
    value: string | boolean,
  ) => {
    const newHours = [...operatingHours]
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      [field]: value,
    }
  }
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Consultation Availability</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {operatingHours.map((dayHours, index) => (
            <div key={dayHours.day} className="flex items-center space-x-4">
              <div className="w-24 text-sm">{dayHours.day}</div>
              {editingDay === dayHours.day ? (
                <div className="flex flex-1 flex-row gap-4">
                  <Input
                    type="time"
                    value={dayHours.opening}
                    onChange={(e) =>
                      handleChange(index, 'opening', e.target.value)
                    }
                    className="w-24"
                  />
                  <Input
                    type="time"
                    value={dayHours.closing}
                    onChange={(e) =>
                      handleChange(index, 'closing', e.target.value)
                    }
                    className="w-24"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  {dayHours.isOpen
                    ? `${dayHours.opening} - ${dayHours.closing}`
                    : 'Closed'}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) =>
                    handleChange(index, 'isOpen', checked)
                  }
                />
                <Label htmlFor={`${dayHours.day}-switch`} hidden>
                  Open
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleEdit(dayHours.day)}
              >
                {editingDay === dayHours.day ? 'Save' : 'Edit'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button type="submit" disabled>
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ConsultationSettings() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 gap-y-6">
        <OnlineStatus />
        <PhysicalStatus />
        <div className="flex flex-col gap-2">
          <Label> Consultation Fee (Ksh)</Label>
          <Input type="number" />
        </div>

        <div>
          <Label htmlFor="appointmentDuration">
            Average Appointment Duration
          </Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <OperatingHours />
      </div>
    </div>
  )
}
