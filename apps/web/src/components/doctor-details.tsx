import { type RouterOutputs } from '@web/trpc/react'
import { Banknote, Hospital, MapPin, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'
import { StarRating } from './star-rating'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

type DoctorDetailsProps = {
  doctor: Omit<RouterOutputs['doctors']['details'], 'reviews' | 'office'> & {
    reviews?: RouterOutputs['doctors']['details']['reviews']
    office?: RouterOutputs['doctors']['details']['office'] | null
  }
}

export default function DoctorDetails({ doctor }: DoctorDetailsProps) {
  // Get the location information, prioritizing facility over office
  const locationInfo = doctor.facility ?? doctor.office ?? null

  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <div className="flex flex-row gap-3">
        <Link href={`/doctors/${doctor.id}`}>
          <Avatar className="size-24 shrink-0 cursor-pointer md:hidden md:size-28">
            <AvatarImage src={doctor.profilePicture?.url} />
            <AvatarFallback>
              {doctor.firstName?.charAt(0)}
              {doctor.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <Link
              href={`/doctors/${doctor.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {doctor.title ?? 'Dr'}. {doctor.firstName} {doctor.lastName}
            </Link>
            <p className="break-words text-muted-foreground">
              {doctor.specialty?.name}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <StarRating
              totalStars={5}
              initialRating={doctor.reviewStats.averageRating}
              readOnly
            />
            <span className="text-sm tracking-wide text-muted-foreground">
              ({doctor.reviewStats.totalReviews} Reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Stethoscope className="size-5 shrink-0" />
          <div>
            <span className="">Specialized in</span>{' '}
            {doctor.subSpecialties.map((subspecialty, index) => (
              <Fragment key={subspecialty.id}>
                <Link
                  href={``}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {subspecialty.name}
                </Link>
                {index < doctor.subSpecialties.length - 1 && ', '}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Hospital className="size-5 shrink-0" />
          <span className="break-words">{locationInfo?.name}</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <MapPin className="size-5 shrink-0" />
          <span className="break-words">{locationInfo?.address}</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Banknote className="size-5 shrink-0" />
          <span className="break-words">
            Consultation Fee: Ksh. {doctor.consultationFee ?? 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}
