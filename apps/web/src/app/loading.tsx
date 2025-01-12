'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative h-48 w-full max-w-3xl">
        <svg
          viewBox="0 0 1000 200"
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-label="Animated heart rate monitor"
        >
          <motion.path
            fill="none"
            strokeWidth="3"
            stroke="currentColor"
            className="text-primary"
            d="M 0 100 
               L 300 100 
               L 325 100 
               Q 335 100 340 50 
               Q 345 0 350 100 
               L 375 100 
               L 400 100 
               Q 410 100 415 150 
               Q 420 200 425 100 
               L 450 100 
               L 475 100 
               Q 485 100 490 25 
               Q 495 -50 500 100 
               L 525 100 
               L 550 100 
               Q 560 100 565 125 
               Q 570 150 575 100 
               L 600 100 
               L 625 100 
               Q 635 100 640 75 
               Q 645 50 650 100 
               L 1000 100"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              pathOffset: [0, 0, 1],
            }}
            transition={{
              duration: 2,
              times: [0, 0.8, 1],
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              stroke: 'url(#gradient)',
            }}
          />
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(254, 46.2%, 33.5%)" />
            <stop offset="50%" stopColor="hsl(254, 46.2%, 43.5%)" />
            <stop offset="100%" stopColor="hsl(254, 46.2%, 33.5%)" />
          </linearGradient>
        </svg>
      </div>
    </div>
  )
}
