'use client'

/**
 * Top Specialists Section
 *
 * Displays a curated list of top-rated verified doctors on the homepage.
 * Fetches real data from the API instead of static dummy data.
 *
 * @module components/top-specialists
 */

import { api } from '@web/trpc/react'
import { ArrowRight, Calendar1Icon, Hospital, MapPin, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter } from './ui/card'

/**
 * Type for a specialist displayed in the card
 */
interface Specialist {
  id: string
  name: string
  title?: string
  specialty?: string
  photoUrl?: string
  medicalCenter?: string
  location?: string
  rating?: number
}

/**
 * Individual specialist card component
 */
function SpecialistCard({ specialist }: { specialist: Specialist }) {
  return (
    <Card className="overflow-hidden border p-0 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative h-[303px] w-full bg-muted">
          <Image
            src={
              specialist.photoUrl ?? '/assets/doctors/placeholder-doctor.png'
            }
            alt={specialist.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 316px"
          />
        </div>

        <div className="flex flex-col items-start gap-2 p-5">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-semibold text-primary">
              {specialist.title && `${specialist.title} `}
              {specialist.name}
            </h3>
            {specialist.rating && specialist.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-amber-500">
                <Star className="size-4 fill-current" />
                <span>{specialist.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {specialist.specialty && (
            <Badge variant="secondary" className="w-fit mb-1">
              {specialist.specialty}
            </Badge>
          )}
          {specialist.medicalCenter && (
            <div className="flex flex-row items-start justify-start gap-1 text-xs text-muted-foreground">
              <Hospital className="size-4 flex-shrink-0" />
              <span className="line-clamp-1">{specialist.medicalCenter}</span>
            </div>
          )}
          {specialist.location && (
            <div className="inline-flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="size-4 flex-shrink-0" />
              <span className="line-clamp-1">{specialist.location}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="inline-flex items-start px-5 pb-5">
        {/* Fixed: Link to actual booking page */}
        <Link href={`/appointments?doctorId=${specialist.id}`}>
          <Button variant={'link'} className="px-0">
            <Calendar1Icon className="mr-1" />
            Schedule appointment
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

/**
 * Loading skeleton for specialist cards
 */
function SpecialistCardSkeleton() {
  return (
    <Card className="overflow-hidden border p-0 shadow-sm animate-pulse">
      <CardContent className="p-0">
        <div className="h-[303px] w-full bg-muted" />
        <div className="flex flex-col items-start gap-2 p-5">
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5">
        <div className="h-4 w-32 bg-muted rounded" />
      </CardFooter>
    </Card>
  )
}

export default function TopSpecialists() {
  // Fetch verified doctors from API
  const { data, isLoading, error } = api.doctors.list.useQuery({
    limit: 4, // Show only 4 top specialists
    page: 1,
  })

  // Transform API data to specialist format
  const specialists: Specialist[] = (data?.doctors ?? []).map((doctor) => ({
    id: doctor.id,
    name: `${doctor.user?.firstName ?? ''} ${doctor.user?.lastName ?? ''}`.trim(),
    title: doctor.title ?? undefined,
    specialty: doctor.specialty?.name ?? undefined,
    photoUrl: doctor.profilePicture?.url ?? undefined,
    medicalCenter: doctor.facility?.name ?? undefined,
    location: doctor.facility?.town ?? doctor.facility?.county ?? undefined,
    rating: doctor.reviewStats?.averageRating ?? undefined,
  }))

  return (
    <section
      id="top-specialists"
      className="container mx-auto flex w-full flex-col items-center justify-center gap-10 py-16"
    >
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
        <h2 className="section-title text-center">Meet Top Specialists</h2>
        <p className="section-description text-center">
          Discover highly recommended doctors and specialists trusted for their
          expertise and exceptional care.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[...Array(4)].map((_, i) => (
            <SpecialistCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center text-muted-foreground py-8">
          <p>Unable to load specialists. Please try again later.</p>
        </div>
      )}

      {!isLoading && !error && specialists.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p>No specialists available at the moment.</p>
        </div>
      )}

      {!isLoading && !error && specialists.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {specialists.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      )}

      {/* Fixed: Added proper href to explore more link */}
      <Link href="/find-specialists">
        <Button variant={'link'}>
          <span>Explore more doctors</span>
          <ArrowRight />
        </Button>
      </Link>
    </section>
  )
}
