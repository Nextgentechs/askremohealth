import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react'

const groundRules = [
  `Ensure you're in a quiet, private space`,
  'Your camera and microphone will be activated',
  'The session is private and confidential',
  'Have any relevant medical documents ready',
  'Stay focused and avoid distractions',
]

export default function PreRoom({
  onJoinRoom,
  joiningRoom,
}: {
  onJoinRoom: () => void
  joiningRoom: boolean
}) {
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false)
  const [isCheckingDevices, setIsCheckingDevices] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingDevices(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="mx-auto h-fit max-w-xl border shadow-sm">
        <CardHeader className="flex flex-col gap-0.5 pb-6">
          <CardTitle className="text-primary font-medium md:text-xl">
            Welcome to Your Virtual Appointment
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm md:text-base">
            Please review these important guidelines before joining
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Alert className="text-start">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Device Check</AlertTitle>
            <AlertDescription>
              {isCheckingDevices ? (
                'Checking your camera and microphone...'
              ) : (
                <span className="flex items-center gap-2">
                  Devices ready
                  <CheckCircle2 className="size-4 text-green-500" />
                </span>
              )}
            </AlertDescription>
          </Alert>
          <div className="text-foreground flex flex-col items-start space-y-4">
            <h3 className="font-medium">Before You Join:</h3>
            <div className="grid w-full gap-2 text-sm">
              {groundRules.map((text, index) => (
                <div
                  key={index}
                  className="flex w-full items-start gap-3 text-start"
                >
                  <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <Alert variant="default" className="text-start">
            <AlertCircle className="size-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              By joining this call, you agree to maintain patient
              confidentiality and understand this is a medical consultation.
            </AlertDescription>
          </Alert>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="accept-rules"
              checked={hasAcceptedRules}
              onChange={(e) => setHasAcceptedRules(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="accept-rules" className="text-foreground text-sm">
              I have read and agree to these guidelines
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onJoinRoom}
            disabled={!hasAcceptedRules || isCheckingDevices}
            className="w-full"
          >
            {joiningRoom ? (
              <>
                <Loader className="size-4 animate-spin" />
                Joining Room
              </>
            ) : (
              'Join Video Room'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
