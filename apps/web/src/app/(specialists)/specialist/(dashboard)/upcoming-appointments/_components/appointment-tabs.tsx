'use client'

import React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
import { DataTable } from '@web/components/data-table'
import { PaginationNext } from '@web/components/ui/pagination'
import {
  PaginationLink,
  PaginationPrevious,
} from '@web/components/ui/pagination'
import { PaginationItem } from '@web/components/ui/pagination'
import { PaginationContent } from '@web/components/ui/pagination'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { type RouterOutputs } from '@web/trpc/react'
import { useSearchParams } from 'next/navigation'
import { Pagination } from '@web/components/ui/pagination'
import { upcommingAppointmentsColumn } from './upcomming-appointments-columns'

function useCreateQueryString() {
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

function AppointmentsPagination({
  pagination,
}: {
  pagination: RouterOutputs['doctors']['upcommingAppointments']['pagination']
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = Number(searchParams.get('page')) ?? 1
  const createQueryString = useCreateQueryString()

  if (pagination.pages <= 1) return null

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

        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
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

        {currentPage < pagination.pages && (
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
  data: RouterOutputs['doctors']['upcommingAppointments']
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useCreateQueryString()

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
        <DataTable
          columns={upcommingAppointmentsColumn}
          data={data.appointments}
        />
        <AppointmentsPagination pagination={data.pagination} />
      </TabsContent>

      <TabsContent value="physical">
        <DataTable
          columns={upcommingAppointmentsColumn}
          data={data.appointments}
        />
        <AppointmentsPagination pagination={data.pagination} />
      </TabsContent>
    </Tabs>
  )
}
