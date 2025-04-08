import { Building2, Video, Shield } from "lucide-react"
import { ServiceCard } from "./service-card"

export function FacilityServices() {
  const services = [
    {
      title: "List Your Hospital, Clinic, Laboratory, or Pharmacy",
      description: "Attract more patients by increasing your online presence.",
      icon: Building2,
    },
    {
      title: "Offer Virtual Consultations",
      description: "Allow your medical staff to conduct remote consultations and follow-ups.",
      icon: Video,
    },
    {
      title: "Boost Patient Trust",
      description: "Gain credibility through verified facility profiles and patient reviews.",
      icon: Shield,
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

