import React from 'react'
import { Card, CardContent, CardFooter } from './ui/card'
import Image from 'next/image'
import { Button } from './ui/button'
import specialists from '@web/data/doctors'
import { Badge } from './ui/badge'
import { ArrowRight, Calendar1Icon, Hospital, MapPin } from 'lucide-react'

function SpecialistCard({
  specialist,
}: {
  specialist: (typeof specialists)[number]
}) {
  return (
    <Card className="overflow-hidden border p-0 shadow-sm">
      <CardContent className="p-0">
        <Image
          src={specialist.photoUrl}
          alt={specialist.name}
          width={316}
          height={303}
          className="h-[303px] w-[316px] object-cover"
        />

        <div className="flex flex-col items-start gap-2 p-5">
          <h3 className="text-base font-semibold text-primary">
            {specialist.title} {specialist.name}
          </h3>
          <Badge variant="secondary" className="w-fit">
            {specialist.specialty}
          </Badge>
          <div className="flex flex-row items-start justify-start gap-1 text-xs text-muted-foreground">
            <Hospital className="size-4" />
            <span> {specialist.medicalCenter}</span>
          </div>
          <div className="inline-flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="size-4" />
            <span>{specialist.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="inline-flex items-start px-5">
        <Button variant={'link'} className="px-0">
          <Calendar1Icon className="" />
          Schedule appointment
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function TopSpecialists() {
  return (
    <section
      id="top-specialists"
      className="container mx-auto flex w-full flex-col items-center justify-center gap-10 py-16"
    >
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
        <h2 className="section-title">Meet Our Top Specialists</h2>
        <p className="section-description">
          Discover highly recommended doctors and specialists trusted for their
          expertise and exceptional care.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {specialists.map((specialist, index) => (
          <SpecialistCard key={index} specialist={specialist} />
        ))}
      </div>

      <Button variant={'link'}>
        <span>Explore more doctors</span>
        <ArrowRight />
      </Button>
    </section>
  )
}
