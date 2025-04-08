import { Stethoscope, Video, Calendar, FileText, Database, Home } from "lucide-react"
import { ServiceCard } from "./service-card"

export function PatientServices() {
  const services = [
    {
      title: "Free Pre-diagnosis Screening",
      description:
        "Our AI pre-diagnosis screening helps you understand your symptoms by asking simple questions, analyzing your responses, and suggesting possible conditions. It then recommends the best doctor or healthcare facility based on urgency, availability, and your convenience.",
      icon: Stethoscope,
    },
    {
      title: "Instant Doctor Consultations",
      description: "Speak to your doctor anytime, anywhere via video calls, chats, or voice calls.",
      icon: Video,
    },
    {
      title: "Seamless Appointment Booking",
      description: "Schedule in-person or virtual visits with top-rated specialists anytime, anywhere.",
      icon: Calendar,
    },
    {
      title: "Prescription Services",
      description: "Receive secure digital prescriptions sent directly to your nearby pharmacy.",
      icon: FileText,
    },
    {
      title: "Medical Records Access",
      description: "View and store your medical history securely online for easy reference.",
      icon: Database,
    },
    {
      title: "Home-Based Care Services",
      description: "Book experienced nurses, clinical nutritionists, and physiotherapists for home visits.",
      icon: Home,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <ServiceCard key={index} title={service.title} description={service.description} icon={service.icon} />
      ))}
    </div>
  )
}

