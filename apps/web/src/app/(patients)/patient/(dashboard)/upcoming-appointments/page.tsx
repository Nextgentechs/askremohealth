import { api } from '@web/trpc/server'
import AppointmentTabs from './_components/appointment-tabs'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type: string; page: string; pageSize: string }>
}) {
  const { type, page, pageSize } = await searchParams
  const data = await api.users.listAppointments({
    type: (type as 'online' | 'physical') ?? 'online',
    page: Number(page) || 1,
    limit: Number(pageSize) || 10,
  })

  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
          Welcome back!{' '}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is a list of your upcoming appointments
        </p>
      </div>

      <AppointmentTabs data={data} />
    </div>
  )
}
