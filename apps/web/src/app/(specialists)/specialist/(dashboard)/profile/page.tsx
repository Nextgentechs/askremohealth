import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
import ConsultationSettings from './_components/consultation-settings'
import PersonalInfo from './_components/personal-info'
import ProfessionalInfo from './_components/professional-info'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
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
