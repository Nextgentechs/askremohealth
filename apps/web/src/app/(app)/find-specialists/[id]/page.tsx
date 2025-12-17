import CalendarComponent from '@web/components/calendar-component'
import DoctorDetails from '@web/components/doctor-details'
import { JsonLd } from '@web/components/json-ld'
import { StarRating } from '@web/components/star-rating'
import { Avatar, AvatarFallback, AvatarImage } from '@web/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { generateDoctorJsonLd } from '@web/lib/structured-data'
import { type RouterOutputs } from '@web/trpc/react'
import { api } from '@web/trpc/server'
import { type Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://askremohealth.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const doctor = await api.doctors.details(id)
  const name =
    `Dr. ${doctor.user?.firstName ?? ''} ${doctor.user?.lastName ?? ''}`.trim()
  const specialtyName = doctor.specialty?.name ?? 'Healthcare Specialist'
  const description =
    doctor.bio ??
    `Book an appointment with ${name} - ${specialtyName} at Ask RemoHealth`

  return {
    title: `${name} - ${specialtyName}`,
    description,
    openGraph: {
      title: `${name} - ${specialtyName} | Ask RemoHealth`,
      description,
      type: 'profile',
      url: `${BASE_URL}/find-specialists/${id}`,
      images: doctor.profilePicture?.url
        ? [{ url: doctor.profilePicture.url, alt: name }]
        : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${name} - ${specialtyName}`,
      description,
      images: doctor.profilePicture?.url
        ? [doctor.profilePicture.url]
        : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/find-specialists/${id}`,
    },
  }
}

function DoctorCard({
  doctor,
}: {
  doctor: RouterOutputs['doctors']['details']
}) {
  return (
    <Card
      key={doctor.id}
      className="h-fit w-full p-6 flex-col justify-between gap-8 rounded-xl border shadow-sm transition-all duration-300 sm:flex-row lg:flex lg:max-w-md lg:flex-row xl:max-w-lg 2xl:max-w-xl"
    >
      <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
        <Avatar className="hidden md:block md:size-28">
          <AvatarImage src={doctor.profilePicture?.url} />
          <AvatarFallback>
            {doctor.user?.firstName?.charAt(0)}
            {doctor.user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <DoctorDetails
          doctor={{
            ...doctor,
            firstName: doctor.user?.firstName,
            lastName: doctor.user?.lastName,
            email: doctor.user?.email,
            bookedSlots: [],
            reviewStats: {
              averageRating: doctor.reviews?.length
                ? doctor.reviews.reduce((acc, r) => acc + r.rating, 0) /
                  doctor.reviews.length
                : 0,
              totalReviews: doctor.reviews?.length ?? 0,
            },
          }}
          showAllLocations={true}
        />
      </div>
    </Card>
  )
}

function AboutDoctor({ about }: { about?: string | null }) {
  if (!about) return null
  return (
    <Card className="flex w-full flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          About Doctor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6 text-foreground">
        <p>{about}</p>
      </CardContent>
    </Card>
  )
}

const reviews = [
  {
    id: '1',
    rating: 5,
    name: 'Wanjiku Kamau',
    date: '2024-02-15',
    comment:
      'The Doctor was very professional and thorough in his examination. He took time to explain everything clearly and made me feel at ease. Highly recommend!',
  },
  {
    id: '2',
    rating: 4,
    name: 'Otieno Kiprop',
    date: '2024-02-10',
    comment:
      'Great experience overall. The doctor was knowledgeable and caring. Only minor issue was the wait time, but the quality of care made up for it.',
  },
  {
    id: '3',
    rating: 5,
    name: 'Aisha Mohamed',
    date: '2024-02-05',
    comment:
      'Excellent physician who really listens to patients. Very detailed in his approach and provides comprehensive treatment plans. Will definitely be coming back.',
  },
  {
    id: '4',
    rating: 4,
    name: 'Njeri Mwangi',
    date: '2024-01-30',
    comment:
      'Very satisfied with my consultation. The doctor was patient and addressed all my concerns. The facility is also well-maintained and clean.',
  },
  {
    id: '5',
    rating: 5,
    name: 'Kimani Ngugi',
    date: '2024-01-25',
    comment:
      "One of the best medical experiences I've had. The doctor is very experienced and has a great bedside manner. The staff were also very helpful and friendly.",
  },
]

function PatientsReviews() {
  return (
    <Card className="flex w-full flex-1 flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Patients Reviews
        </CardTitle>
      </CardHeader>

      <CardContent className="flex w-full flex-col items-start gap-8 pt-6 text-sm text-foreground">
        {reviews?.map((review) => (
          <div key={review.id} className="flex flex-col items-start gap-2">
            <div className="flex w-full flex-row items-center justify-between text-start">
              <p className="font-medium text-primary">{review.name}</p>
              <p className="text-muted-foreground">{review.date}</p>
            </div>
            <StarRating initialRating={review.rating} totalStars={5} readOnly />
            <p className="text-start">{review.comment}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doctor = await api.doctors.details(id)

  // Prepare locations from facility and office
  const locations = [
    doctor.facility && {
      name: doctor.facility.name,
      county: doctor.facility.county,
      address: doctor.facility.address,
    },
    doctor.office && {
      name: doctor.office.name,
      county: doctor.office.county,
      address: doctor.office.address,
    },
  ].filter(Boolean) as Array<{
    name: string | null
    county: string | null
    address: string | null
  }>

  // Prepare structured data
  const jsonLdData = generateDoctorJsonLd({
    id: doctor.id,
    firstName: doctor.user?.firstName,
    lastName: doctor.user?.lastName,
    specialization: doctor.specialty?.name,
    bio: doctor.bio,
    profilePicture: doctor.profilePicture,
    locations: locations.length > 0 ? locations : undefined,
    reviewStats: doctor.reviewStats,
  })

  return (
    <>
      <JsonLd data={jsonLdData} />
      <main className="container mx-auto mb-48 mt-12 flex min-h-screen w-full flex-col gap-12">
        <Breadcrumb className="lg:ps-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/find-specialists">Doctors</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {doctor.user?.firstName} {doctor.user?.lastName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-8 lg:flex-row">
          <DoctorCard doctor={doctor} />
          <div className="flex flex-1 flex-col gap-8">
            <AboutDoctor about={doctor.bio} />
            <CalendarComponent
              doctorId={doctor.id}
              operatingHours={doctor.operatingHours}
              bookedSlots={(doctor.bookedSlots ?? []).map(
                (d: string) => new Date(d),
              )}
            />
            <PatientsReviews />
          </div>
        </div>
      </main>
    </>
  )
}
