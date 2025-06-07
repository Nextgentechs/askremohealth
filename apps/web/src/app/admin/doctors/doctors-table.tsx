'use client'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@web/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination'
import { type RouterOutputs } from '@web/trpc/react'
import { format } from 'date-fns'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function DoctorsPagination({
  pagination,
}: {
  pagination: RouterOutputs['admin']['getDoctors']['pagination']
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentPage = Number(searchParams.get('page')) ?? 1

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

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
                  `${pathname}?${createQueryString('page', (currentPage - 1).toString())}`,
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
                    `${pathname}?${createQueryString('page', page.toString())}`,
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
                  `${pathname}?${createQueryString('page', (currentPage + 1).toString())}`,
                )
              }
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

type Doctor = RouterOutputs['admin']['getDoctors']['data'][number]

export const DoctorsColumns: ColumnDef<Doctor>[] = [
  {
    accessorKey: 'user.firstName',
    header: 'Name',
    accessorFn: (row) => {
      return `${row.user.firstName} ${row.user.lastName}`
    },
    cell: ({ row }) => {
      const doctor = row.original
      return (
        <Link
          className="underline-offset-4 hover:text-primary hover:underline"
          href={`/admin/doctors/${doctor.id}`}
        >
          {doctor.user.firstName} {doctor.user.lastName}
        </Link>
      )
    },
  },
  {
    accessorKey: 'user.phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return row.original.status === 'verified' ? (
        <Badge variant="completed">Verified</Badge>
      ) : row.original.status === 'pending' ? (
        <Badge variant="pending">Pending</Badge>
      ) : (
        <Badge variant="missed">Rejected</Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Joined',
    accessorFn: (row) => {
      return format(row.createdAt, 'MMM dd, yyyy')
    },
  },
]
