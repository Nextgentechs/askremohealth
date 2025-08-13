import { DataTable } from '@web/components/data-table'
import { api } from '@web/trpc/server'
import { columns } from './columns'
import { Loader } from 'lucide-react'
import { auth } from '@web/auth'


export default async function Page() {
  const session = await auth();
  const labId = session?.user?.lab?.placeId;
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
