'use client'

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import {
  type Room,
  type LocalVideoTrack,
  type LocalParticipant,
  type RemoteParticipant,
} from 'twilio-video'
import { Button } from '@web/components/ui/button'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  AlertCircle,
  Loader,
} from 'lucide-react'
import { Slider } from '@web/components/ui/slider'
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert'
import PreRoom from './pre-room'
import LocalVideoRoom from './local-video-room'
import useVideoSetup from './use-video-setup'
import { PostCall } from './post-call'

type VideoState = {
  room: Room | null
  localParticipant: LocalParticipant | null
  remoteParticipant: RemoteParticipant | null
  localTrack: LocalVideoTrack | null
  isMuted: boolean
  isVideoOff: boolean
  volume: number
  showChat: boolean
  showPreRoom: boolean
  joiningRoom: boolean
  showPostCall: boolean
}

type VideoActions = {
  setRoom: (room: Room | null) => void
  setLocalParticipant: (participant: LocalParticipant | null) => void
  setRemoteParticipant: (participant: RemoteParticipant | null) => void
  setLocalTrack: (track: LocalVideoTrack | null) => void
  setIsMuted: (muted: boolean) => void
  setIsVideoOff: (off: boolean) => void
  setVolume: (volume: number) => void
  setShowChat: (show: boolean) => void
  setShowPreRoom: (show: boolean) => void
  setJoiningRoom: (joining: boolean) => void
  setShowPostCall: (show: boolean) => void
  toggleMute: () => void
  toggleVideo: () => void
}

type VideoStore = VideoState & VideoActions

export const useVideoStore = create<VideoStore>((set, get) => ({
  room: null,
  localParticipant: null,
  remoteParticipant: null,
  localTrack: null,
  isMuted: false,
  isVideoOff: false,
  volume: 100,
  showChat: false,
  showPreRoom: true,
  joiningRoom: false,
  showPostCall: false,

  setRoom: (room) => set({ room }),
  setLocalParticipant: (participant) => set({ localParticipant: participant }),
  setRemoteParticipant: (participant) =>
    set({ remoteParticipant: participant }),
  setLocalTrack: (track) => set({ localTrack: track }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setIsVideoOff: (off) => set({ isVideoOff: off }),
  setVolume: (volume) => set({ volume }),
  setShowChat: (show) => set({ showChat: show }),
  setShowPreRoom: (show) => set({ showPreRoom: show }),
  setJoiningRoom: (joining) => set({ joiningRoom: joining }),
  setShowPostCall: (show) => set({ showPostCall: show }),
  toggleMute: () => {
    const { localParticipant, isMuted } = get()
    if (localParticipant) {
      localParticipant.audioTracks.forEach((publication) => {
        if (publication.track) {
          if (isMuted) {
            publication.track.enable()
          } else {
            publication.track.disable()
          }
        }
      })
      set({ isMuted: !isMuted })
    }
  },
  toggleVideo: () => {
    const { localParticipant, isVideoOff } = get()
    if (localParticipant) {
      localParticipant.videoTracks.forEach((publication) => {
        if (publication.track) {
          if (isVideoOff) {
            publication.track.enable()
          } else {
            publication.track.disable()
          }
        }
      })
      set({ isVideoOff: !isVideoOff })
    }
  },
  toggleChat: () => set((state) => ({ showChat: !state.showChat })),
}))

function VideoControls({ isEndingSessions }: { isEndingSessions: boolean }) {
  const { isMuted, isVideoOff, volume, toggleMute, toggleVideo, setVolume } =
    useVideoStore()
  const { handleEndCall } = useVideoSetup(
    useVideoStore.getState().room?.name ?? '',
  )

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    if (typeof newVolume === 'number') {
      setVolume(newVolume)
      const remoteVideo = document
        .getElementById('remote-video')
        ?.querySelector('video') as HTMLVideoElement | null

      if (remoteVideo) {
        remoteVideo.volume = newVolume / 100
      }
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 rounded-lg bg-card p-4">
      <Button
        variant={isMuted ? 'destructive' : 'secondary'}
        size="icon"
        onClick={toggleMute}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button
        variant={isVideoOff ? 'destructive' : 'secondary'}
        size="icon"
        onClick={toggleVideo}
      >
        {isVideoOff ? <VideoOff /> : <Video />}
      </Button>
      <Button variant="destructive" size="icon" onClick={handleEndCall}>
        {isEndingSessions ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <Phone className="rotate-225" />
        )}
      </Button>
      <div className="flex w-48 items-center gap-2">
        <Volume2 className="h-4 w-4" />
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
        />
      </div>
    </div>
  )
}

function MainVideoRoom({
  localVideoRef,
  remoteVideoRef,
  isEndingSessions,
}: {
  localVideoRef: React.RefObject<HTMLDivElement>
  remoteVideoRef: React.RefObject<HTMLDivElement>
  isEndingSessions: boolean
}) {
  return (
    <div className="grid h-full grid-cols-12 gap-4 lg:container lg:mx-auto">
      <div className="col-span-12 flex flex-col gap-4">
        <div className="relative h-[70vh] min-h-[300px] rounded-lg bg-background">
          <div
            id="remote-video"
            className="h-full w-full overflow-hidden rounded-lg bg-muted"
            ref={remoteVideoRef}
          />
          <div
            id="local-video"
            className="absolute bottom-4 right-4 aspect-video w-48 overflow-hidden rounded-lg bg-muted shadow-lg transition-all hover:scale-105 sm:w-64 md:w-80 lg:w-96"
            ref={localVideoRef}
          />
        </div>

        <VideoControls isEndingSessions={isEndingSessions} />
      </div>
    </div>
  )
}

export function VideoRoom({ appointmentId }: { appointmentId: string }) {
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  const {
    room,
    localParticipant,
    remoteParticipant,
    showPreRoom,
    joiningRoom,
    localTrack,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff,
    showPostCall,
  } = useVideoStore()
  const { joinRoom, handleEndCall, isEndingSessions } =
    useVideoSetup(appointmentId)

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

  if (showPostCall) {
    return <PostCall />
  }

  if (showPreRoom) {
    return (
      <PreRoom
        onJoinRoom={() => joinRoom(localVideoRef, remoteVideoRef)}
        joiningRoom={joiningRoom}
      />
    )
  }

  if (room && localParticipant && !remoteParticipant) {
    return (
      <LocalVideoRoom
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        toggleMute={toggleMute}
        toggleVideo={toggleVideo}
        handleEndCall={handleEndCall}
        isEndingSessions={isEndingSessions}
        localVideoRef={localVideoRef}
      />
    )
  }

  return (
    <div className="">
      {room && localParticipant && remoteParticipant ? (
        <MainVideoRoom
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isEndingSessions={isEndingSessions}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connecting...</AlertTitle>
            <AlertDescription>
              Please wait while we connect you to the video room.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
