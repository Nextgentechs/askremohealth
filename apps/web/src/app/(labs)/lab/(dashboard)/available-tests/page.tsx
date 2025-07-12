import { DataTable } from '@web/components/data-table'
import { type AppointmentStatus } from '@web/server/utils'
import { api } from '@web/trpc/server'


export default async function page({
 

  
}) {
 
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Online Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage all your previous and upcoming online appointments here
        </p>
      </div>

      <div className="flex flex-col gap-8">
        My Tests
      </div>
    </div>
  )
}
