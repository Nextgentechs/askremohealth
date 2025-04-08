"use client"

import { Card, CardContent } from "./ui/card"
import {
  Building,
  Building2,
  FlaskRound,
  Pill,
  Home,
  Ambulance,
  Stethoscope,
  Smile,
  Eye,
  Scan,
  Baby,
  HeartPulse,
  Activity,
} from "lucide-react"
import { useState } from "react"
import {
  CustomAccordion,
  CustomAccordionItem,
  CustomAccordionTrigger,
  CustomAccordionContent,
} from "./ui/custom-accordion"

export function FacilityCategories() {
  const [medicalClinicsOpen, setMedicalClinicsOpen] = useState(false)
  const [specializedClinicsOpen, setSpecializedClinicsOpen] = useState(false)

  const mainFacilities = [
    {
      id: "private-hospitals",
      name: "Private Hospitals",
      icon: Building,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "public-hospitals",
      name: "Public Hospitals",
      icon: Building2,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "clinical-laboratories",
      name: "Clinical Laboratories",
      icon: FlaskRound,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "chemists",
      name: "Chemists",
      icon: Pill,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "home-care",
      name: "Home-based Care Services",
      icon: Home,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "ambulance",
      name: "Ambulance Service Providers",
      icon: Ambulance,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
  ]

  const generalClinics = {
    id: "general-clinics",
    name: "General Medical Clinics",
    icon: Stethoscope,
    color: "bg-[#553DA6]", 
    lightColor: "bg-[#FFF4EB]", // Light cream
  }

  const specializedClinics = [
    {
      id: "dental-clinics",
      name: "Dental Clinics",
      icon: Smile,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "eye-clinics",
      name: "Eye Clinics",
      icon: Eye,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "diagnostic-centers",
      name: "Diagnostic Centers",
      icon: Scan,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "obgyn-clinics",
      name: "Obstetrics & Gynecology Clinics",
      icon: Baby,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "fertility-clinics",
      name: "Reproductive Health & Fertility Clinics",
      icon: HeartPulse,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
    {
      id: "physiotherapy-clinics",
      name: "Physiotherapy Clinics",
      icon: Activity,
      color: "bg-[#553DA6]", 
      lightColor: "bg-[#FFF4EB]", // Light cream
    },
  ]

  return (
    <section className="bg-secondary py-16 xl:px-56">
      <h2 className="text-3xl font-bold text-center text-[#553DA6] mb-8">Categories of Healthcare Facilities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mainFacilities.map((facility) => (
          <Card key={facility.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className={`h-1 ${facility.color}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${facility.lightColor}`}>
                  <facility.icon className={`h-6 w-6 ${facility.color.replace("bg-", "text-")}`} />
                </div>
                <div>
                  <span className="text-lg font-medium text-[#553DA6]">
                    {facility.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomAccordion>
        <CustomAccordionItem>
          <CustomAccordionTrigger
            className="bg-gradient-to-r from-[#553DA6] to-[#7755E8] text-white hover:opacity-90"
            isOpen={medicalClinicsOpen}
            onClick={() => setMedicalClinicsOpen(!medicalClinicsOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-medium">Medical Clinics</span>
            </div>
          </CustomAccordionTrigger>
          <CustomAccordionContent isOpen={medicalClinicsOpen}>
            <div className="px-6 pb-4">
              <Card className="overflow-hidden border-none shadow-md mb-4">
                <div className={`h-1 ${generalClinics.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${generalClinics.lightColor}`}>
                      <generalClinics.icon className={`h-6 w-6 ${generalClinics.color.replace("bg-", "text-")}`} />
                    </div>
                    <span className="text-lg font-medium text-[#553DA6]">{generalClinics.name}</span>
                  </div>
                </CardContent>
              </Card>

              <CustomAccordion>
                <CustomAccordionItem>
                  <CustomAccordionTrigger
                    className="bg-gradient-to-r from-[#553DA6] to-[#7755E8] text-white hover:opacity-90"
                    isOpen={specializedClinicsOpen}
                    onClick={() => setSpecializedClinicsOpen(!specializedClinicsOpen)}
                  >
                    <span className="text-lg font-medium">Specialized Health Clinics</span>
                  </CustomAccordionTrigger>
                  <CustomAccordionContent isOpen={specializedClinicsOpen}>
                    <div className="pt-4 pb-4 px-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {specializedClinics.map((clinic) => (
                          <Card
                            key={clinic.id}
                            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className={`h-1 ${clinic.color}`}></div>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${clinic.lightColor}`}>
                                  <clinic.icon className={`h-5 w-5 ${clinic.color.replace("bg-", "text-")}`} />
                                </div>
                                <span className="font-medium text-[#553DA6]">
                                  {clinic.name}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CustomAccordionContent>
                </CustomAccordionItem>
              </CustomAccordion>
            </div>
          </CustomAccordionContent>
        </CustomAccordionItem>
      </CustomAccordion>
    </section>
  )
}


