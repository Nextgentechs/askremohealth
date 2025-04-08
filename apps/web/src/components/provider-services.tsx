import { Users, Calendar, TrendingUp, Plane, Brain } from "lucide-react"
import { ServiceCard } from "./service-card"

export function ProviderServices() {
  const services = [
    {
      title: "Expand Your Practice",
      description: "List your services and connect with patients who need medical consultations.",
      icon: Users,
    },
    {
      title: "Online Appointment Management",
      description: "Easily manage bookings and provide virtual care through secure video calls and chats.",
      icon: Calendar,
    },
    {
      title: "Targeted Digital Marketing",
      description:
        "Boost visibility and grow your practice with customized healthcare marketing strategies. Our marketing tools help you enhance visibility and reach more patients effectively.",
      icon: TrendingUp,
    },
    {
      title: "Medical Tourism Service",
      description: "We provide medical tourism services by linking you up to preferred hospitals across the world.",
      icon: Plane,
    },
    {
      title: "AI Medical Referral",
      description:
        "Our AI pre-diagnosis screening connects you with the right patients, reducing unnecessary visits and saving time. With better-matched cases, you can focus on delivering quality care where it's needed most.",
      icon: Brain,
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

