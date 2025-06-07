"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Home, Globe, Shield, Package, Users, Brain } from "lucide-react"
import { Card, CardContent } from "./ui/card"

const features = [
  {
    icon: Home,
    title: "Convenience",
    description: "Access healthcare services without leaving your home.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Connect with top specialists across the World.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your health data is protected with industry-standard security measures.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Package,
    title: "Comprehensive Services",
    description: "Everything from consultations to prescriptions, home care, and emergency services—all in one place.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Users,
    title: "Intelligent Patient Allocation",
    description: "Priorities patients based on urgency, availability and convenience enhancing resources utilization.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Brain,
    title: "AI Driven Pre-Diagnosis",
    description: "Enables you to understand your symptoms better. This can help you change your lifestyle.",
    color: "bg-rose-100 text-rose-600",
  },
]

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-12 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Choose <span className="text-blue-600">Ask RemoHealth</span>?
        </h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card
              className={`h-full transition-all duration-300 ${
                hoveredIndex === index ? "shadow-lg transform -translate-y-1" : "shadow"
              }`}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
