'use client'

import { api } from '@web/trpc/react'
import { Filter } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { Label } from './ui/label'
import { Skeleton } from './ui/skeleton'
import { Switch } from './ui/switch'

export function SubSpecialtiesFilterSkeleton() {
  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-6 w-4" />
            <Skeleton className="h-6 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SubSpecialtiesFilter() {
  const [subSpecialties, setSubSpecialties] = React.useState<string[]>([])
  const searchParams = useSearchParams()
  const specialty = searchParams.get('specialty')
  const { data, isLoading } = api.specialties.listSubSpecialties.useQuery(
    { specialityId: specialty ?? '' },
    { enabled: !!specialty },
  )

  if (isLoading) return <SubSpecialtiesFilterSkeleton />
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 border-b py-6">
      <p className="text-start font-semibold text-primary">Sub Specialty</p>
      <div className="flex flex-col gap-3">
        {data?.map((subSpecialty) => (
          <div key={subSpecialty.id} className="flex items-center space-x-2">
            <Switch
              id={subSpecialty.id}
              checked={subSpecialties?.includes(subSpecialty.id)}
              onCheckedChange={(checked) => {
                setSubSpecialties(
                  checked
                    ? [...subSpecialties, subSpecialty.id]
                    : subSpecialties.filter((id) => id !== subSpecialty.id),
                )
              }}
            />
            <Label className="text-sm font-normal" htmlFor={subSpecialty.id}>
              {subSpecialty.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

const experienceOptions = [
  { label: '0-5 years', value: '0-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10-15 years', value: '10-15' },
  { label: '15+ years', value: '15+' },
]

export function ExperienceFilter() {
  const [experiences, setExperiences] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-4 border-b py-6">
      <p className="text-start font-semibold text-primary">Experience</p>
      <div className="flex flex-col gap-3">
        {experienceOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Switch
              id={option.value}
              checked={experiences?.includes(option.value)}
              onCheckedChange={(checked) => {
                setExperiences(
                  checked
                    ? [...experiences, option.value]
                    : experiences.filter((id) => id !== option.value),
                )
              }}
            />
            <Label className="text-sm font-normal" htmlFor={option.value}>
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

export function GenderFilter() {
  const [genders, setGenders] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-4 border-b py-6">
      <p className="text-start font-semibold text-primary">Gender</p>
      <div className="flex flex-col gap-3">
        {genderOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Switch
              id={option.value}
              checked={genders?.includes(option.value)}
              onCheckedChange={(checked) => {
                setGenders(
                  checked
                    ? [...genders, option.value]
                    : genders.filter((id) => id !== option.value),
                )
              }}
            />
            <Label className="text-sm font-normal" htmlFor={option.value}>
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

const entityOptions = [
  { label: 'Hospital', value: 'hospital' },
  { label: 'Clinic', value: 'clinic' },
]

function EntityFilter() {
  const [entities, setEntities] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-4 border-b py-6">
      <p className="text-start font-semibold text-primary">Entity</p>
      <div className="flex flex-col gap-3">
        {entityOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Switch
              id={option.value}
              checked={entities?.includes(option.value)}
              onCheckedChange={(checked) => {
                setEntities(
                  checked
                    ? [...entities, option.value]
                    : entities.filter((id) => id !== option.value),
                )
              }}
            />
            <Label className="text-sm font-normal" htmlFor={option.value}>
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DoctorFilters() {
  return (
    <div className="mb-10 hidden h-fit w-full max-w-xs rounded-xl p-0 shadow-sm xl:block">
      <div className="flex flex-row items-start gap-2 rounded-b-none rounded-t-xl border border-primary bg-primary p-6 text-primary-foreground">
        <Filter />
        <span className="text-lg font-semibold">Filters</span>
      </div>

      <div className="flex flex-col rounded-b-xl border-x border-b px-6 pb-6">
        <SubSpecialtiesFilter />
        <ExperienceFilter />
        <GenderFilter />
        <EntityFilter />
      </div>
    </div>
  )
}
