import DoctorDetails from '@web/components/doctor-details'
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
import { type RouterOutputs } from '@web/trpc/react'
import { api } from '@web/trpc/server'

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
            {doctor.firstName?.charAt(0)}
            {doctor.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <DoctorDetails doctor={doctor} />
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
  const doctor = await api.doctors.details((await params).id)
  return (
    <main className="container mx-auto mb-48 mt-12 flex min-h-screen w-full flex-col gap-12">
      <Breadcrumb className="lg:ps-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/doctors`}>Doctors</BreadcrumbLink>
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
          <PatientsReviews />
        </div>
      </div>
    </main>
  )
}
