'use client'

import { motion } from 'framer-motion'
import { Heart, Hospital, MessageCircle, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface Stat {
  label: string
  value: number
  icon: JSX.Element
}

const useIncrement = (target: number, duration: number, startIncrement: boolean) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (!startIncrement) return

    let start: number | undefined
    const step = (timestamp: number) => {
      if (start === undefined) start = timestamp
      const progress = timestamp - start
      const increment = (progress / duration) * target
      setCurrentValue(Math.min(Math.floor(increment), target))
      if (progress < duration) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [target, duration, startIncrement])

  return currentValue
}

const StatsSection: React.FC = () => {
  const [startIncrement, setStartIncrement] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70 && !startIncrement) {
        setStartIncrement(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [startIncrement])

  // Define stats
  const healthcareProviders = useIncrement(250, 3000, startIncrement)
  const patients = useIncrement(920, 3000, startIncrement)
  const hospitals = useIncrement(30, 3000, startIncrement)
  const consultations = useIncrement(600, 3000, startIncrement)

  const stats: Stat[] = [
    {
      label: 'Specialists',
      value: healthcareProviders,
      icon: (
        <div className="p-3 rounded-full bg-blue-50">
          <Stethoscope className="h-10 w-10 text-blue-500" />
        </div>
      ),
    },
    {
      label: 'Patients',
      value: patients,
      icon: (
        <div className="p-3 rounded-full bg-green-50">
          <Heart className="h-10 w-10 text-green-500" />
        </div>
      ),
    },
    {
      label: 'Hospitals',
      value: hospitals,
      icon: (
        <div className="p-3 rounded-full bg-gray-100">
          <Hospital className="h-10 w-10 text-gray-500" />
        </div>
      ),
    },
    {
      label: 'Consultations',
      value: consultations,
      icon: (
        <div className="p-3 rounded-full bg-yellow-50">
          <MessageCircle className="h-10 w-10 text-yellow-500" />
        </div>
      ),
    },
  ]
  

  return (
    <div className="container flex flex-col mx-auto text-center items-center py-16">
      <h2 className="section-title">Ask Remohealth at Glance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white rounded-lg shadow-sm p-3"
          >
            <Card className="flex flex-col items-center px-16">
              <CardHeader className="flex items-center">
                {/* icon already has a key above just in case */}
                {stat.icon}
                <CardTitle className="text-md font-normal text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-center ">
                {stat.value}
                {(stat.label === 'Consultations' || stat.label === 'Patients') && '+'}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default StatsSection
