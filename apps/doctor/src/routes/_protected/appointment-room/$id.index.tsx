import useVideoSetup from '@/hooks/use-video-setup'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useVideoStore } from '@/store/video-store'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'

import PreRoom from '@/components/video-room/pre-room'
import MainVideoRoom from '@/components/video-room/main-video-room'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const Route = createFileRoute('/_protected/appointment-room/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  const { room, localParticipant, showPreRoom, joiningRoom, localTrack } =
    useVideoStore()
  const { joinRoom, isEndingSessions } = useVideoSetup(id)

  useEffect(() => {
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
