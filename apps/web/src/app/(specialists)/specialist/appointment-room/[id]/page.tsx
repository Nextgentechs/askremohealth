'use client'

import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'
import MainVideoRoom from '../_components/main-video-room'
import PreRoom from '../_components/pre-room'
import useVideoSetup from '../_components/use-video-setup'
import { useVideoStore } from '../_components/video-store'

export default function Page() {
  const { id } = useParams()

  const localVideoRef = React.useRef<HTMLDivElement>(null)
  const remoteVideoRef = React.useRef<HTMLDivElement>(null)

  const { room, localParticipant, showPreRoom, joiningRoom, localTrack } =
    useVideoStore()
  const { joinRoom, isEndingSessions } = useVideoSetup(id as string)

  React.useEffect(() => {
    return () => {
      if (localTrack) {
        localTrack.stop()
      }
      if (room) {
        room.disconnect()
      }
    }
  }, [localTrack, room])

  if (showPreRoom) {
    return (
      <PreRoom
        onJoinRoom={() => joinRoom(localVideoRef, remoteVideoRef)}
        joiningRoom={joiningRoom}
      />
    )
  }

  if (!room || !localParticipant) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connecting...</AlertTitle>
          <AlertDescription>
            Please wait while we connect you to the video room.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <MainVideoRoom
      localVideoRef={localVideoRef}
      remoteVideoRef={remoteVideoRef}
      isEndingSessions={isEndingSessions}
    />
  )
}
