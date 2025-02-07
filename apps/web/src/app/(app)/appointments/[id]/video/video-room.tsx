'use client'

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import {
  type Room,
  type LocalVideoTrack,
  type LocalParticipant,
  type RemoteParticipant,
  type LocalAudioTrack,
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
import useVideoSetup from './use-video-setup'
import { PostCall } from './post-call'

type VideoState = {
  room: Room | null
  localParticipant: LocalParticipant | null
  remoteParticipant: RemoteParticipant | null
  localTrack: LocalVideoTrack | null
  localAudioTrack: LocalAudioTrack | null
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
  setLocalAudioTrack: (track: LocalAudioTrack | null) => void
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
  localAudioTrack: null,
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
  setLocalAudioTrack: (track) => set({ localAudioTrack: track }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setIsVideoOff: (off) => set({ isVideoOff: off }),
  setVolume: (volume) => set({ volume }),
  setShowChat: (show) => set({ showChat: show }),
  setShowPreRoom: (show) => set({ showPreRoom: show }),
  setJoiningRoom: (joining) => set({ joiningRoom: joining }),
  setShowPostCall: (show) => set({ showPostCall: show }),
  toggleMute: () => {
    const { localAudioTrack, isMuted } = get()
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.enable()
      } else {
        localAudioTrack.disable()
      }
      set({ isMuted: !isMuted })
    }
  },
  toggleVideo: () => {
    const { localTrack, isVideoOff } = get()
    if (localTrack) {
      if (isVideoOff) {
        localTrack.enable()
      } else {
        localTrack.disable()
      }
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-background p-2 shadow-lg backdrop-blur-sm">
        <Button
          variant={isMuted ? 'destructive' : 'ghost'}
          size="icon"
          className=""
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>
        <Button
          variant={isVideoOff ? 'destructive' : 'ghost'}
          size="icon"
          className=""
          onClick={toggleVideo}
        >
          {isVideoOff ? (
            <VideoOff className="size-5" />
          ) : (
            <Video className="size-5" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="size-11 rounded-full bg-red-500 hover:bg-red-600"
          onClick={handleEndCall}
        >
          {isEndingSessions ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            <Phone className="rotate-225 size-5" />
          )}
        </Button>
      </div>

      <div className="hidden items-center gap-2 rounded-full bg-zinc-800/90 px-4 py-2 shadow-lg backdrop-blur-sm sm:flex">
        <Volume2 className="size-4 text-zinc-400" />
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-24 cursor-pointer xl:w-32 2xl:w-40"
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
  const { remoteParticipant } = useVideoStore()

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full w-full p-4 sm:p-6 md:p-8">
        <div
          ref={remoteVideoRef}
          id="remote-video"
          className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900"
        >
          {!remoteParticipant && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <Loader className="h-8 w-8 animate-spin text-zinc-400" />
              <Alert variant="default" className="w-auto border-none">
                <AlertCircle className="h-4 w-4" />

                <AlertTitle className="text-card-foreground">
                  Waiting for other participant
                </AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  The other participant hasn&apos;t joined the room yet.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div
          ref={localVideoRef}
          id="local-video"
          className="absolute bottom-24 right-8 aspect-video w-[200px] overflow-hidden rounded-xl bg-zinc-800 shadow-lg transition-transform hover:scale-105 sm:bottom-28 sm:right-10 sm:w-[280px] md:right-12 md:w-[320px]"
        />

        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center md:bottom-12 lg:bottom-14">
          <VideoControls isEndingSessions={isEndingSessions} />
        </div>
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
    localTrack,
    showPostCall,
    showPreRoom,
    joiningRoom,
  } = useVideoStore()
  const { joinRoom, isEndingSessions } = useVideoSetup(appointmentId)

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
