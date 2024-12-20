import { api } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { ChevronDown, CloudUpload } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

function SubSpecialtySelect({ specialty }: { specialty: string }) {
  const [open, setOpen] = useState(false)

  const { data: subspecialties } = api.specialties.listSubSpecialties.useQuery({
    specialityId: specialty,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex items-end justify-end disabled:cursor-not-allowed"
          disabled={!specialty}
        >
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col">
          {subspecialties?.map((option) => (
            <div
              className="mb-1 flex w-full cursor-pointer flex-row gap-4 text-sm"
              key={option.id}
            >
              <Checkbox />
              <span> {option.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ProfessionalInfoForm() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const { data: specialties } = api.specialties.listSpecialties.useQuery()
  const { data: facilities } = api.facilities.list.useQuery()
  return (
    <Card className="w-full shadow-sm">
      <CardHeader></CardHeader>
      <CardContent>
        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedSpecialty(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {specialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.specialty?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subSpecialty">Sub Specialty</Label>

              <SubSpecialtySelect specialty={selectedSpecialty} />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.subSpecialty?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.experience?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="registerionNumber">
                Medical Registration Number
              </Label>
              <Input id="registerionNumber" type="text" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.registrationNumber?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {facilities?.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.facility?.message}
              </p> */}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button type="submit" disabled>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function RegulatoryCertificates() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Regulatory Certificates</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex w-full flex-row justify-between">
          <h4 className="text-sm">University Degree</h4>
          <Badge className="rounded-full" variant={'outline'}>
            Approved
          </Badge>
          <Button variant={'outline'}>
            <CloudUpload />
            <span>Upload</span>
          </Button>
        </div>

        <div className="flex w-full flex-row justify-between">
          <h4 className="text-sm">Medical Licenses</h4>
          <Badge className="rounded-full" variant={'outline'}>
            Approved
          </Badge>
          <Button variant={'outline'}>
            <CloudUpload />
            <span>Upload</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfessionalInfo() {
  return (
    <div className="flex flex-col gap-6">
      <ProfessionalInfoForm />
      <RegulatoryCertificates />
    </div>
  )
}
