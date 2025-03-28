'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Image from 'next/image';

const services = [
  {
    id: 1,
    icon: <Image src="/assets/services/virtual.png" alt="Video Consult" width={80}
    height={80} className="h-20 w-20 object-contain" />,
    title: "Virtual Doctor Consultations",
    description: "Schedule video or chat-based consultations with licensed healthcare professionals across multiple specialties in the World.",
  },
  {
    id: 2,
    icon: <Image src="/assets/services/diagnosis.png" alt="Video Consult" width={100}
    height={100} className="h-20 w-20" />,
    title: "Ai powered pre-diagnosis screening",
    description: "AI pre-diagnosis screening helps you identify possible conditions by asking about your symptoms and analyzing them. It then recommends the best doctor or healthcare facility for you based on availability, urgency, and convenience.",
  },
  {
    id: 3,
    icon: <Image src="/assets/services/directory.png" alt="Healthcare Directory" width={100}
    height={100} className="h-20 w-20" />,
    title: "Healthcare Directory",
    description: "Book hospitals, laboratories, pharmacies, and home care services in The World.",
  },
  {
    id: 4,
    icon: <Image src="/assets/services/ambulance.png" alt="Video Consult" width={100}
    height={100} className="h-20 w-20" />,
    title: "24/7 Ambulance Services",
    description: "Get emergency transport services immediately.",
  },
  {
    id: 5,
    icon: <Image src="/assets/services/home-care.png" alt="Video Consult" width={100}
    height={100} className="h-20 w-20" />,
    title: "Home-Based Care",
    description: "Benefit from individualized home care services like nursing, dietetics, and physiotherapy.",
  },
  {
    id: 6,
    icon: <Image src="/assets/services/education.png" alt="Health Education" width={100}
    height={100} className="h-20 w-20" />,
    title: "Health Education & Wellness Resources",
    description: "Receive health news from leading professionals in articles, blogs, and videos on medical conditions, treatments, and prevention.",
  },
]

export default function ServicesSection() {
  return (
    <section className="container mx-auto flex flex-col items-center gap-6 py-16">
      <h2 className="section-title">Key Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className="group transition-colors duration-300 hover:bg-[#553DA6]"
          >
            <CardHeader className="flex items-center space-x-4">
              {service.icon}
              <CardTitle className="text-lg lg:text-xl font-medium text-primary text-center group-hover:text-white">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center group-hover:text-white">{service.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}