"use client"

import type React from "react"

import Link from "next/link"
import { Building2, Stethoscope, FlaskRoundIcon as Flask } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@web/lib/utils"

interface HealthcareNavigationProps {
  className?: string
}

export default function HealthcareNavigation({ className }: HealthcareNavigationProps) {
  return (
    <section className={cn("container mx-auto mt-20 sm:mt-0 flex flex-col items-center gap-6 py-8", className)}>
      <div className="container mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavigationCard
            title="Doctors"
            description="Manage patient appointments"
            icon={<Stethoscope className="h-8 w-8" />}
            href="https://doctors.askremohealth.com/"
          />

          <NavigationCard
            title="Hospitals/Clinics"
            description="Get listed for visibility"
            icon={<Building2 className="h-8 w-8" />}
            href="/hospitals"
          />

          <NavigationCard
            title="Labs"
            description="Submit and access test results"
            icon={<Flask className="h-8 w-8" />}
            href="/laboratories"
          />
        </div>
      </div>
    </section>
  )
}

interface NavigationCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

function NavigationCard({ title, description, icon, href }: NavigationCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="mb-4 text-gray-700">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <Link href={href} className="mt-auto">
        <Button className="w-full">Access Portal</Button>
      </Link>
    </div>
  )
}
