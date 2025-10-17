import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs'
import AdminDetailsProfileForm from './AdminDetailsProfileForm'


export default function Page() {
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Admin Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and update your admin account information.
        </p>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="personalInfo" className="flex flex-col gap-6">
        <TabsList className="grid w-fit grid-cols-1">
          <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab Content */}
        <TabsContent value="personalInfo">
          <AdminDetailsProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
