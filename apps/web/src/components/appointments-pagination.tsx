'use client'
import { type RouterOutputs } from '@web/trpc/react'
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Pagination,
} from './ui/pagination'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import React, { useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next-nprogress-bar'

export default function AppointmentsPagination({
  meta,
}: {
  meta: RouterOutputs['users']['listAppointments']['meta']
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= meta.pageCount && page !== meta.page) {
      router.push(pathname + '?' + createQueryString('page', page.toString()))
    }
  }

  return (
    <Pagination className="py-5">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(1)
            }}
            aria-disabled={meta.page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(meta.page - 1)
            }}
            aria-disabled={meta.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        {Array.from({ length: meta.pageCount }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === meta.page}
              aria-disabled={p === meta.page || p > meta.pageCount}
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(p)
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(meta.page + 1)
            }}
            aria-disabled={meta.page === meta.pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(meta.pageCount)
            }}
            aria-disabled={meta.page === meta.pageCount}
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
