import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
  AppointmentStatus,
  appointmentStatusOptions,
} from './physical-appointments'
import { FacetedFilter } from '@/components/faceted-filters'
import { DataTable } from '@/components/data-table'
import { DateRangePicker } from '@/components/date-range-picker'
import { RouterOutputs } from '@web/server/api'
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination'
import { upcommingAppointmentsColumn } from '@/components/dashboard/columns'
import SearchableDropdown from '@/components/searchable-dropdown'
import { api } from '@/lib/trpc'
import React from 'react'

const appointmentsSchema = z.object({
  type: z.enum(['physical', 'online']).catch('online'),
  patientId: z.string().optional().catch(undefined),
  startDate: z.coerce
    .date()
    .optional()
    .default(() => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      return date
    }),
  endDate: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
  status: z.nativeEnum(AppointmentStatus).optional().catch(undefined),
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_protected/online-appointments')({
  validateSearch: appointmentsSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { trpcQueryUtils } }) => {
    const loaderData =
      await trpcQueryUtils.doctors.allAppointments.ensureData(search)
    return loaderData
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-wide">
          Online Appointments
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage all your previous and upcomming online appointments here
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Filters />
        <DataTable
          columns={upcommingAppointmentsColumn}
          data={loaderData.appointments}
        />
        <AppointmentsPagination pagination={loaderData.pagination} />
      </div>
    </div>
  )
}

function Filters() {
  const [searchTerm, setSearchTerm] = React.useState('')

  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: patients, isLoading: isLoadingPatients } =
    api.doctors.searchPatient.useQuery({
      query: searchTerm,
    })

  const handleFilterChange = (values: string[]) => {
    console.log(values)
  }

  return (
    <div>
      <div className="flex w-full flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <SearchableDropdown
            loading={isLoadingPatients}
            options={
              patients?.map((patient) => ({
                value: patient.id,
                label: `${patient.firstName} ${patient.lastName}`,
              })) ?? []
            }
            placeholder="Select Patient"
            onChange={(value) => {
              setSearchTerm(value)
            }}
            onSelect={(value) => {
              navigate({ search: { patientId: value.value } })
            }}
          />
          <FacetedFilter
            onFilterChange={handleFilterChange}
            title="Status"
            options={appointmentStatusOptions}
          />
        </div>

        <DateRangePicker
          from={searchParams.startDate}
          to={searchParams.endDate}
          onDateChange={(range) => {
            navigate({ search: { startDate: range.from, endDate: range.to } })
          }}
        />
      </div>
    </div>
  )
}

function AppointmentsPagination({
  pagination,
}: {
  pagination: RouterOutputs['doctors']['allAppointments']['pagination']
}) {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const currentPage = search.page ?? 1

  if (pagination.pages <= 1) return null

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 && (
            <PaginationPrevious
              className="hover:cursor-pointer"
              onClick={() =>
                navigate({
                  search: { ...search, page: currentPage - 1 },
                })
              }
            />
          )}
        </PaginationItem>

        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <PaginationLink
                className="hover:cursor-pointer"
                onClick={() =>
                  navigate({
                    search: { ...search, page },
                  })
                }
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        {currentPage < pagination.pages && (
          <PaginationItem>
            <PaginationNext
              className="hover:cursor-pointer"
              onClick={() =>
                navigate({
                  search: { ...search, page: currentPage + 1 },
                })
              }
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
