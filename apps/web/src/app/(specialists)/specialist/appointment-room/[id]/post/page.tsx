import Logo from '@web/components/logo'
import PostMeetingForm from './post-meeting-form'

export default function page() {
  return (
    <div className="h-screen w-screen content-center mx-auto p-6 md:p-12 xl:p-24 relative">
      <div className="absolute top-4 left-6 md:left-12 xl:left-24">
        <Logo />
      </div>
      <div className="w-fit mx-auto">
        <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
          Post Appointment
        </h1>
        <p className="text-muted-foreground text-sm">
          Thank you for completing the appointment. Please take a moment to
          review and document any important notes or follow-up actions.
        </p>
        <PostMeetingForm />
      </div>
    </div>
  )
}
