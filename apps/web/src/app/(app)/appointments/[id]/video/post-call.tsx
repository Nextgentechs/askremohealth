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
import { toast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export function PostCall() {
  const params = useParams()
  const appointmentId = params?.id as string

  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate: submitReview, isPending } = api.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitted(true)
      toast({ title: 'Thank you for your review!' })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      })
    },
  })

  const handleSubmitReview = () => {
    if (!appointmentId || rating === 0) return

    submitReview({
      appointmentId,
      rating,
      comment: review || undefined,
    })
  }

  if (submitted) {
    return (
      <Card className="mx-auto w-full max-w-xl border shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold">Review Submitted!</h2>
          <p className="text-center text-muted-foreground">
            Thank you for sharing your experience. Your feedback helps improve
            healthcare for everyone.
          </p>
          <Link href="/patient/appointments" className="mt-4">
            <Button>View My Appointments</Button>
          </Link>
        </CardContent>
      </Card>
    )
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
              maxLength={1000}
            />
            <span className="text-xs text-muted-foreground text-right">
              {review.length}/1000
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-end justify-between">
        <Link href="/patient/appointments" className="w-fit">
          <Button variant="link" className="w-fit">
            <ArrowLeft className="" />
            Back to Appointments
          </Button>
        </Link>

        <Button
          className="w-fit"
          onClick={handleSubmitReview}
          disabled={rating === 0 || isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </CardFooter>
    </Card>
  )
}
