'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type StarRatingProps = {
  initialRating?: number
  totalStars?: number
  onRatingChange?: (rating: number) => void
  readOnly?: boolean
}

export function StarRating({
  initialRating = 0,
  totalStars = 5,
  onRatingChange,
  readOnly = false,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  const handleClick = (selectedRating: number) => {
    if (!readOnly) {
      setRating(selectedRating)
      if (onRatingChange) {
        onRatingChange(selectedRating)
      }
    }
  }

  const handleMouseEnter = (starIndex: number) => {
    if (!readOnly) {
      setHover(starIndex)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHover(0)
    }
  }

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1
        return (
          <Star
            key={index}
            className={`size-4 cursor-pointer ${
              starValue <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${readOnly ? 'cursor-default' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        )
      })}
      {/* <span className="ml-2 text-accent">{rating}</span> */}
    </div>
  )
}
