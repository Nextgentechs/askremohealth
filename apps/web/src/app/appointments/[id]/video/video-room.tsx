'use client'

import { useEffect, useState } from 'react'
import { connect, type Room } from 'twilio-video'
import { api } from '@web/trpc/react'
import { Button } from '@web/components/ui/button'

export function VideoRoom({ appointmentId }: { appointmentId: string }) {
  const [room, setRoom] = useState<Room | null>(null)
  const { mutateAsync: createRoom } = api.video.createRoom.useMutation()
  const { mutateAsync: generateToken } = api.video.generateToken.useMutation()

  const joinRoom = async () => {
    try {
      const { roomName } = await createRoom({ appointmentId })
      const { token } = await generateToken({ appointmentId, roomName })
      const videoRoom = await connect(token, {
        name: roomName,
        audio: true,
        video: true,
      })

      setRoom(videoRoom)
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  useEffect(() => {
    return () => {
      room?.disconnect()
    }
  }, [room])

  return (
    <div className="flex flex-col gap-4">
      {!room ? (
        <Button onClick={joinRoom}>Join Call</Button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div id="local-video" />
          <div id="remote-video" />
          <Button onClick={() => room.disconnect()}>End Call</Button>
        </div>
      )}
    </div>
  )
}
