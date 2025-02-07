'use client'

import { StarRating } from '@web/components/star-rating'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Textarea } from '@web/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function PostCall() {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  const handleSubmitReview = () => {
    console.log({
      rating,
      review,
    })
  }

  return (
    <Card className="mx-auto w-full max-w-xl border shadow-sm">
      <CardHeader className="flex flex-col gap-1 pb-6">
        <CardTitle className="font-medium text-primary md:text-xl">
          Thank you for using our service!
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground sm:text-sm md:text-base">
          Your doctor will review your consultation and send any necessary
          prescriptions or follow-up messages through our platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            How was your experience?
          </h3>
          <div className="flex w-full flex-col items-center gap-2">
            <label className="text-sm text-muted-foreground">
              Rate your doctor
            </label>
            <StarRating
              initialRating={rating}
              onRatingChange={setRating}
              totalStars={5}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">
              Leave a review (optional)
            </label>
            <Textarea
              placeholder="Share your experience with the doctor..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-end justify-between">
        <Link href="/dashboard" className="w-fit">
          <Button variant="link" className="w-fit">
            <ArrowLeft className="" />
            Home
          </Button>
        </Link>

        <Button
          className="w-fit"
          onClick={handleSubmitReview}
          disabled={rating === 0}
        >
          Submit Review
        </Button>
      </CardFooter>
    </Card>
  )
}
