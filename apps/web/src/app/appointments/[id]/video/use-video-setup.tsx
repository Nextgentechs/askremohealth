import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { useVideoStore } from './video-room'
import {
  connect,
  createLocalVideoTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
} from 'twilio-video'

export default function useVideoSetup(appointmentId: string) {
  const { toast } = useToast()
  const {
    setRoom,
    setLocalParticipant,
    setLocalTrack,
    setRemoteParticipant,
    setShowPreRoom,
    setJoiningRoom,
    room,
    localTrack,
    setShowPostCall,
  } = useVideoStore()

  const { mutateAsync: createRoom } = api.video.createRoom.useMutation()
  const { mutateAsync: generateToken } = api.video.generateToken.useMutation()
  const { mutateAsync: endSession, isPending: isEndingSessions } =
    api.video.endSession.useMutation()

  const attachLocalTrack = (
    track: LocalVideoTrack,
    localVideoRef: React.RefObject<HTMLDivElement>,
  ) => {
    try {
      const element = track.attach()
      element.style.width = '100%'
      element.style.height = '100%'
      element.style.objectFit = 'cover'

      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = ''
        localVideoRef.current.appendChild(element)
      } else {
        setTimeout(() => {
          const container = document.getElementById('local-video')
          if (!container) {
            toast({
              title: 'An error occurred',
              description: 'Please refresh the page',
            })
            throw new Error('Local video container not found')
          }
          container.innerHTML = ''
          container.appendChild(element)
        }, 100)
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Please refresh the page',
      })
      console.error(err)
    }
  }

  const attachRemoteParticipant = (
    participant: RemoteParticipant,
    remoteVideoRef: React.RefObject<HTMLDivElement>,
  ) => {
    setRemoteParticipant(participant)
    toast({
      title: 'Participant joined',
      description: 'The other participant has joined the call.',
    })

    participant.tracks.forEach((publication) => {
      if (publication.track) {
        if (
          publication.track.kind === 'video' ||
          publication.track.kind === 'audio'
        ) {
          const mediaTrack = publication.track
          const element = mediaTrack.attach()
          if (publication.track.kind === 'video') {
            element.style.width = '100%'
            element.style.height = '100%'
            element.style.objectFit = 'cover'

            if (remoteVideoRef.current) {
              remoteVideoRef.current.innerHTML = ''
              remoteVideoRef.current.appendChild(element)
            } else {
              const container = document.getElementById('remote-video')
              if (container) {
                container.innerHTML = ''
                container.appendChild(element)
              }
            }
          }
        }
      }
    })

    participant.on('trackSubscribed', (track) => {
      if (track.kind === 'video' || track.kind === 'audio') {
        const element = track.attach()
        if (track.kind === 'video') {
          element.style.width = '100%'
          element.style.height = '100%'
          element.style.objectFit = 'cover'

          if (remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = ''
            remoteVideoRef.current.appendChild(element)
          } else {
            const container = document.getElementById('remote-video')
            if (container) {
              container.innerHTML = ''
              container.appendChild(element)
            }
          }
        }
      }
    })

    participant.on('disconnecteds', () => {
      setRemoteParticipant(null)
      toast({
        title: 'Participant left',
        description: 'The other participant has left the call.',
      })
    })
  }

  const handleEndCall = async () => {
    try {
      const roomAppointmentId = room?.name?.replace('appointment-', '')
      if (roomAppointmentId && room?.name) {
        await endSession({
          appointmentId: roomAppointmentId,
          roomName: room.name,
        })
      }

      if (room) {
        room.disconnect()
      }
      if (localTrack) {
        localTrack.stop()
      }

      setShowPostCall(true)
    } catch (error) {
      console.error('Error ending call:', error)
      toast({
        title: 'Error',
        description: 'Failed to end the call. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const joinRoom = async (
    localVideoRef: React.RefObject<HTMLDivElement>,
    remoteVideoRef: React.RefObject<HTMLDivElement>,
  ) => {
    setJoiningRoom(true)
    try {
      const track = await createLocalVideoTrack({
        width: 640,
        height: 480,
      })

      const { roomName } = await createRoom({ appointmentId })
      const { token } = await generateToken({ appointmentId, roomName })
      const videoRoom = await connect(token, {
        name: roomName,
        tracks: [track],
      })

      setRoom(videoRoom)
      setLocalParticipant(videoRoom.localParticipant)
      setLocalTrack(track)

      videoRoom.participants.forEach((participant) =>
        attachRemoteParticipant(participant, remoteVideoRef),
      )
      videoRoom.on('participantConnected', (participant) =>
        attachRemoteParticipant(participant, remoteVideoRef),
      )

      attachLocalTrack(track, localVideoRef)

      setShowPreRoom(false)
    } catch (error) {
      console.error('Error in joinRoom:', error)
      toast({
        title: 'An error occurred',
        description: 'Could not join call',
      })
    } finally {
      setJoiningRoom(false)
    }
  }

  return {
    joinRoom,
    handleEndCall,
    isEndingSessions,
  }
}
