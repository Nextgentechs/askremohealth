import { upcommingAppointmentsColumn } from '@/components/dashboard/columns'
import { DataTable } from '@/components/data-table'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tabs, TabsContent } from '@radix-ui/react-tabs'
import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/dashboard/upcomming-appointments')({
  validateSearch: z.object({
    type: z.enum(['physical', 'online']).catch('online'),
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { trpcQueryUtils } }) => {
    const loaderData =
      await trpcQueryUtils.appointments.doctor.upcomming.ensureData(search.type)
    return loaderData
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: '/dashboard/upcomming-appointments' })
  const loaderData = useLoaderData({
    from: '/dashboard/upcomming-appointments',
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-wide">
          Welcome back!{' '}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here is a list of your upcomming appointments
        </p>
      </div>

      <Tabs defaultValue="onlineAppointments" className="flex flex-col gap-4">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger
            onClick={() =>
              navigate({
                search: { type: 'online' },
              })
            }
            value="onlineAppointments"
          >
            Online Appointments
          </TabsTrigger>
          <TabsTrigger
            value="physicalAppointments"
            onClick={() =>
              navigate({
                search: { type: 'physical' },
              })
            }
          >
            Physical Appointments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="onlineAppointments">
          <DataTable columns={upcommingAppointmentsColumn} data={loaderData} />
        </TabsContent>
        <TabsContent value="physicalAppointments">
          <DataTable columns={upcommingAppointmentsColumn} data={loaderData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
