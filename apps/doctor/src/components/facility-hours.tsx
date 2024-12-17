import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFormContext } from 'react-hook-form'
import { AvailabilityDetails } from './auth/availability-details'

export default function FacilityHours() {
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const { setValue, watch } = useFormContext<AvailabilityDetails>()

  const operatingHours = watch('operatingHours')

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
    setValue('operatingHours', newHours, { shouldValidate: true })
  }

  return (
    <Card className="mx-auto w-full max-w-lg p-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle>Operating Hours</CardTitle>
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
    </Card>
  )
}
