import React from 'react'

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen w-screen flex-row items-center justify-center">
      <div className="relative h-1 w-full max-w-[70%] overflow-hidden bg-gray-300 sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%]">
        <div className="animate-streaming-progress absolute left-0 top-0 h-full w-1/2 bg-primary"></div>
      </div>
    </div>
  )
}
