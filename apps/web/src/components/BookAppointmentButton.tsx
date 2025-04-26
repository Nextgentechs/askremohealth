'use client'

import Link from 'next/link'
import { Button } from './ui/button'

type Props = React.HTMLAttributes<HTMLDivElement>

const BookAppointmentButton = ({ className, ...props }: Props) => {
  return (
    <div className={className} {...props}>
      <Link href="/auth">
        <Button variant="default" className="md:py-6 md:text-lg">Book Appointment</Button>
      </Link>
    </div>
  )
}

export default BookAppointmentButton
