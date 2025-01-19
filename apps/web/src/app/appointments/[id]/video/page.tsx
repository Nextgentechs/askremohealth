import { VideoRoom } from './video-room'

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="container mb-40 mt-12 flex min-h-screen w-full flex-col gap-12 xl:mb-2">
      <VideoRoom appointmentId={id} />
    </div>
  )
}
