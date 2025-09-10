import { DataTable } from '@web/components/data-table'
import { api } from '@web/trpc/server'
import { columns } from './columns'
import { Loader } from 'lucide-react'
import { getCurrentUser } from '@web/auth'


export default async function Page() {
  const session = await getCurrentUser();
  // The session object directly contains the labId if the user is a lab.
  // Assuming the session object for a 'lab' role would have a 'id' property that corresponds to the labId.
  // If the session object for a lab user has a different structure, this might need adjustment.
  const labId = session?.role === "lab" ? session.id : undefined;
  console.log(labId)

  if (!labId) {
    return <div className="flex justify-center items-center h-64">Lab not found or user not associated with a lab.</div>;
  }

  const labTestsData = await api.labs.getLabTestsByLabId({ labId });
  const labTestsAvailable = labTestsData; // Assuming the API directly returns the array

  if (!labTestsAvailable) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" /></div>;
  }
 
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-8">
        <DataTable columns={columns} data={labTestsAvailable} />
      </div>
    </div>
  )
}
