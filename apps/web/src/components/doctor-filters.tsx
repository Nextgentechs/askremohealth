import React from 'react'
import { Filter } from 'lucide-react'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

const filterOptions = [
  {
    section: 'Sub Specialty',
    options: [
      {
        label: 'Adult-Psychiatry',
        value: 'adult-psychiatry',
      },
      {
        label: 'Child-Psychiatry',
        value: 'child-psychiatry',
      },
      {
        label: 'Geriatric-Psychiatry',
        value: 'geriatric-psychiatry',
      },
      {
        label: 'Addiction-Psychiatry',
        value: 'addiction-psychiatry',
      },
    ],
  },
  {
    section: 'Experience',
    options: [
      {
        label: '0-5 years',
        value: '0-5',
      },
      {
        label: '5-10 years',
        value: '5-10',
      },
      {
        label: '10-15 years',
        value: '10-15',
      },
      {
        label: '15+ years',
        value: '15+',
      },
    ],
  },
  {
    section: 'Availability',
    options: [
      {
        label: 'Anyday',
        value: 'anyday',
      },
      {
        label: 'Today',
        value: 'today',
      },
      {
        label: 'Tomorrow',
        value: 'tomorrow',
      },
    ],
  },

  {
    section: 'Gender',
    options: [
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
    ],
  },
  {
    section: 'Entity',
    options: [
      {
        label: 'Hospital',
        value: 'hospital',
      },
      {
        label: 'Clinic',
        value: 'clinic',
      },
    ],
  },
]

export default function DoctorFilters() {
  return (
    <div className="mb-10 hidden h-fit w-full max-w-xs rounded-xl p-0 shadow-sm lg:block">
      <div className="flex flex-row items-start gap-2 rounded-b-none rounded-t-xl border border-primary bg-primary p-6 text-primary-foreground">
        <Filter />
        <span className="text-lg font-semibold">Filters</span>
      </div>

      <div className="flex flex-col rounded-b-xl border-x border-b px-6 pb-6">
        {filterOptions.map((option) => (
          <div
            className="flex flex-col gap-4 border-b py-6"
            key={option.section}
          >
            <p className="text-start font-semibold text-primary">
              {option.section}
            </p>
            <div className="flex flex-col gap-3">
              {option.options.map((filter) => (
                <div key={filter.value} className="flex items-center space-x-2">
                  <Switch id={filter.value} />
                  <Label className="text-sm font-normal" htmlFor={filter.value}>
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
