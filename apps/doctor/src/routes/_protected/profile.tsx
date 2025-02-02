import ConsultationSettings from '@/components/profile/consultation-settings'
import PersonalInfo from '@/components/profile/personal-info'
import ProfessionalInfo from '@/components/profile/professional-info'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-wide">
          My Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Update your profile information
        </p>
      </div>

      <Tabs defaultValue="personalInfo" className="flex flex-col gap-6">
        <TabsList className="gird w-fit grid-cols-3">
          <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
          <TabsTrigger value="professionalInfo">Professional Info</TabsTrigger>
          <TabsTrigger value="consultationSettings">
            Consultation Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalInfo">
          <PersonalInfo />
        </TabsContent>
        <TabsContent value="professionalInfo">
          <ProfessionalInfo />
        </TabsContent>
        <TabsContent value="consultationSettings">
          <ConsultationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
