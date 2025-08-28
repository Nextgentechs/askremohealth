import { AspectRatio } from '@web/components/ui/aspect-ratio'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { Card, CardHeader, CardTitle } from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
import { Textarea } from '@web/components/ui/textarea'
import { type RouterOutputs } from '@web/server/api'
import { api } from '@web/trpc/server'
import Image from 'next/image'
import { DoctorActions } from './doctor-actions'
import { CertificateLink } from '@web/components/certificate-link'

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const doctorId = (await params).id
  const doctor = await api.admin.getDoctor({ id: doctorId })
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="">Doctors</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{`${doctor?.title}. ${doctor?.user?.firstName} ${doctor?.user?.lastName}`}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="personalInfo" className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between">
          <TabsList className="gird w-fit grid-cols-3">
            <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
            <TabsTrigger value="professionalInfo">
              Professional Info
            </TabsTrigger>
            <TabsTrigger value="consultationSettings">
              Consultation Settings
            </TabsTrigger>
          </TabsList>

          <DoctorActions doctor={doctor} />
        </div>
        <TabsContent value="personalInfo">
          <div className="grid grid-cols-3 gap-4">
            <ProfilePhoto doctor={doctor} />
            <PersonalInfo doctor={doctor} />
          </div>
        </TabsContent>
        <TabsContent value="professionalInfo">
          <div className="flex flex-col gap-6">
            <ProfessionalInfo doctor={doctor} />
            <RegulatoryCertificates certificates={doctor.certificates} />
          </div>
        </TabsContent>
        <TabsContent value="consultationSettings">
          <ConsultationInfo doctor={doctor} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfilePhoto({
  doctor,
}: {
  doctor: RouterOutputs['admin']['getDoctor']
}) {
  return (
    <div className="col-span-1">
      <AspectRatio className="bg-muted" ratio={3 / 4}>
        <Image
          src={doctor?.profilePicture?.url ?? ''}
          alt={doctor?.user?.firstName ?? ''}
          fill
          className="rounded-lg object-cover"
          priority
        />
      </AspectRatio>
    </div>
  )
}

function PersonalInfo({
  doctor,
}: {
  doctor: RouterOutputs['admin']['getDoctor']
}) {
  return (
    <Card className="col-span-2 border pt-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="firstName" className="">
            First Name
          </Label>
          <Input
            readOnly
            value={doctor?.user?.firstName}
            id="firstName"
            type="text"
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="lastName" className="">
            Last Name
          </Label>
          <Input readOnly value={doctor?.user?.lastName} id="lastName" type="text" />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="email">Email</Label>
          <Input readOnly value={doctor?.user?.email ?? ''} id="email" type="email" />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="phone">Phone Number</Label>
          <Input readOnly value={doctor?.phone ?? ''} id="phone" type="tel" />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            readOnly
            value={
              doctor?.dob
                ? new Date(doctor.dob).toISOString().split('T')[0]
                : ''
            }
            id="dob"
            type="date"
          />
        </div>

        <div className="col-span-2 flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="bio">Bio</Label>
          <Textarea readOnly value={doctor?.bio ?? ''} id="bio" />
        </div>
      </div>
    </Card>
  )
}

function ProfessionalInfo({
  doctor,
}: {
  doctor: RouterOutputs['admin']['getDoctor']
}) {
  return (
    <Card className="w-full border shadow-sm">
      <CardHeader></CardHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            readOnly
            value={doctor?.specialty?.name ?? ''}
            id="specialty"
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="subSpecialty">Sub Specialty</Label>
          <Input
            readOnly
            value={
              doctor?.subSpecialties?.map((sub) => sub.name).join(', ') ?? ''
            }
            id="subSpecialty"
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            readOnly
            value={doctor?.experience ?? ''}
            id="experience"
            type="number"
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="registrationNumber">
            Medical Registration Number
          </Label>
          <Input
            readOnly
            value={doctor?.licenseNumber ?? ''}
            id="registrationNumber"
            type="text"
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-foreground">
          <Label htmlFor="facility">Facility</Label>
          <Input readOnly value={doctor?.facility?.name ?? ''} id="facility" />
        </div>
      </div>
    </Card>
  )
}

function RegulatoryCertificates({
  certificates,
}: {
  certificates: RouterOutputs['admin']['getDoctor']['certificates']
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex w-full items-start border-b pb-6">
        <CardTitle className="text-xl font-medium">
          Regulatory Certificates
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-4 pt-6">
        {certificates.map((certificate) => {
          const friendlyName = certificate.name
            .split('/')
            .pop()
            ?.split('-')
            .join(' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
          return (
            <CertificateLink
              key={certificate.id}
              certificateId={certificate.id}
              certificateName={certificate.name}
              friendlyName={friendlyName ?? ''}
            />
          )
        })}
      </div>
    </Card>
  )
}

function ConsultationInfo({
  doctor,
}: {
  doctor: RouterOutputs['admin']['getDoctor']
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 gap-y-6">
        <div className="flex flex-col gap-2">
          <Label> Consultation Fee (Ksh)</Label>
          <Input value={doctor.consultationFee ?? ''} readOnly type="number" />
        </div>

        <div>
          <Label htmlFor="appointmentDuration">
            Average Appointment Duration
          </Label>
          <Input
            value={doctor.operatingHours[0]?.consultationDuration ?? ''}
            readOnly
            type="number"
          />
        </div>

        <OperatingHours operatingHours={doctor.operatingHours} />
      </div>
    </div>
  )
}

function OperatingHours({
  operatingHours,
}: {
  operatingHours: RouterOutputs['admin']['getDoctor']['operatingHours']
}) {
  console.log('operatingHours', operatingHours)
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex items-start border-b pb-4">
        <CardTitle className="text-lg font-medium">
          Consultation Availability
        </CardTitle>
      </CardHeader>

      <div className="space-y-2 pt-4">
        {operatingHours[0]?.schedule?.map((dayHours) => (
          <div
            key={dayHours.day}
            className="flex items-center justify-center space-x-4 space-y-2"
          >
            <div className="w-24 text-sm">{dayHours.day}</div>

            <div className="flex-1 text-sm text-muted-foreground">
              {dayHours.isOpen
                ? `${dayHours.opening} - ${dayHours.closing}`
                : 'Closed'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
