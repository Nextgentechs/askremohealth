'use client'

import { DataTable } from '@web/components/data-table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
import { type RouterOutputs } from '@web/trpc/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { appointmentsColumns } from './upcoming-appointments-columns'

export function useQueryString() {
  const searchParams = useSearchParams()

  return React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )
}

export function PatientsPagination({
  pagination,
}: {
  pagination: RouterOutputs['users']['listAppointments']['meta']
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = Number(searchParams.get('page')) ?? 1
  const createQueryString = useQueryString()

  if (pagination.pageCount <= 1) return null

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 && (
            <PaginationPrevious
              className="hover:cursor-pointer"
              onClick={() =>
                router.push(
                  pathname +
                    '?' +
                    createQueryString('page', (currentPage - 1).toString()),
                )
              }
            />
          )}
        </PaginationItem>

        {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <PaginationLink
                className="hover:cursor-pointer"
                onClick={() =>
                  router.push(
                    pathname + '?' + createQueryString('page', page.toString()),
                  )
                }
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        {currentPage < pagination.pageCount && (
          <PaginationItem>
            <PaginationNext
              className="hover:cursor-pointer"
              onClick={() =>
                router.push(
                  pathname +
                    '?' +
                    createQueryString('page', (currentPage + 1).toString()),
                )
              }
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

export default function AppointmentTabs({
  data,
}: {
  data: RouterOutputs['users']['listAppointments']
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useQueryString()

  return (
    <Tabs
      defaultValue="online"
      value={searchParams.get('type') ?? 'online'}
      className="flex flex-col gap-8"
    >
      <TabsList className="grid w-fit grid-cols-2">
        <TabsTrigger
          onClick={() =>
            router.push(pathname + '?' + createQueryString('type', 'online'))
          }
          value="online"
        >
          Online Appointments
        </TabsTrigger>

        <TabsTrigger
          value="physical"
          onClick={() =>
            router.push(pathname + '?' + createQueryString('type', 'physical'))
          }
        >
          Physical Appointments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="online" className="">
        <DataTable columns={appointmentsColumns} data={data.appointments} />
        <PatientsPagination pagination={data.meta} />
      </TabsContent>

      <TabsContent value="physical">
        <DataTable columns={appointmentsColumns} data={data.appointments} />
        <PatientsPagination pagination={data.meta} />
      </TabsContent>
    </Tabs>
  )
} 