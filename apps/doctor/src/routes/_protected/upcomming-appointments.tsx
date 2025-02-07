import { upcommingAppointmentsColumn } from '@/components/dashboard/columns'
import { DataTable } from '@/components/data-table'
import {
  PaginationContent,
  PaginationNext,
  PaginationLink,
  PaginationPrevious,
  PaginationItem,
} from '@/components/ui/pagination'
import { Pagination } from '@/components/ui/pagination'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RouterOutputs } from '@/lib/trpc'
import { Tabs, TabsContent } from '@radix-ui/react-tabs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_protected/upcomming-appointments')({
  validateSearch: z.object({
    type: z.enum(['physical', 'online']).catch('online'),
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
  }),

  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { trpcQueryUtils } }) => {
    const loaderData = await trpcQueryUtils.doctors.upcommingAppointments.fetch(
      {
        type: search.type,
        page: search.page,
        pageSize: search.pageSize,
      },
    )
    return loaderData
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const loaderData = Route.useLoaderData()
  const search = Route.useSearch()

  return (
    <div className="mb-20 flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-wide">
          Welcome back!{' '}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here is a list of your upcomming appointments
        </p>
      </div>

      <Tabs
        defaultValue="online"
        value={search.type}
        className="flex flex-col gap-4"
      >
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger
            onClick={() =>
              navigate({
                search: { type: 'online' },
              })
            }
            value="online"
          >
            Online Appointments
          </TabsTrigger>
          <TabsTrigger
            value="physical"
            onClick={() =>
              navigate({
                search: { type: 'physical' },
              })
            }
          >
            Physical Appointments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="online" className="flex flex-col gap-8">
          <DataTable
            columns={upcommingAppointmentsColumn}
            data={loaderData.appointments}
          />
          <AppointmentsPagination pagination={loaderData.pagination} />
        </TabsContent>
        <TabsContent value="physical">
          <DataTable
            columns={upcommingAppointmentsColumn}
            data={loaderData.appointments}
          />
          <AppointmentsPagination pagination={loaderData.pagination} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AppointmentsPagination({
  pagination,
}: {
  pagination: RouterOutputs['doctors']['upcommingAppointments']['pagination']
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
