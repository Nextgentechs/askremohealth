import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../ui/card'

import { MicOff, Mic, VideoOff, Video, AlertCircle, Loader } from 'lucide-react'

export default function LocalVideoRoom({
  isMuted,
  isVideoOff,
  toggleMute,
  toggleVideo,
  handleEndCall,
  isEndingSessions,
  localVideoRef,
}: {
  isMuted: boolean
  isVideoOff: boolean
  toggleMute: () => void
  toggleVideo: () => void
  handleEndCall: () => void
  isEndingSessions: boolean
  localVideoRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-4xl border-none shadow-none">
        <CardHeader className="gap-0.1 flex flex-col pb-6">
          <CardDescription className="text-muted-foreground text-xs sm:text-sm md:text-base">
            You&apos;re connected and waiting for the other participant to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div
                id="local-video"
                className="bg-muted aspect-video w-full overflow-hidden rounded-lg"
                ref={localVideoRef}
              />
            </div>
            <Alert className="text-start">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Getting Ready</AlertTitle>
              <AlertDescription>
                You can test your audio and video while you wait.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="flex gap-2">
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
          </div>
          <Button variant="destructive" onClick={handleEndCall}>
            {isEndingSessions ? (
              <>
                <Loader className="size-4 animate-spin" />
                <span>Leaving Room</span>
              </>
            ) : (
              'Leave Room'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
