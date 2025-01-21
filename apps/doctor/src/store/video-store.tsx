import {
  type Room,
  type LocalVideoTrack,
  type LocalParticipant,
  type RemoteParticipant,
} from 'twilio-video'
import { create } from 'zustand'

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
