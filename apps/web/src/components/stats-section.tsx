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
    if (!startIncrement) return // Do nothing if startIncrement is false

    let start: number
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const increment = (progress / duration) * target
      setCurrentValue(Math.min(Math.floor(increment), target))
      if (progress < duration) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [target, duration, startIncrement]) // Add startIncrement as a dependency

  return currentValue
}

const StatsSection: React.FC = () => {
  const [startIncrement, setStartIncrement] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70 && !startIncrement) {
        setStartIncrement(true) // Start the increment process
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [startIncrement])

  const stats: Stat[] = [
    {
      label: 'Healthcare Providers',
      value: 250,
      icon: <Stethoscope className="h-6 w-6 text-blue-500" />,
    },
    {
      label: 'Patients',
      value: 920,
      icon: <Heart className="h-6 w-6 text-green-500" />,
    },
    {
      label: 'Hospitals',
      value: 30,
      icon: <Hospital className="h-6 w-6 text-gray-500" />,
    },
    {
      label: 'Consultations',
      value: 600,
      icon: <MessageCircle className="h-6 w-6 text-yellow-500" />,
    },
  ]

  return (
    <div className="container flex flex-col mx-auto items-center py-16">
      <h2 className="section-title">By the Numbers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat, index) => {
          const currentValue = useIncrement(stat.value, 3000, startIncrement) // Pass startIncrement
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <Card className="flex flex-col items-center px-4">
                <CardHeader className="flex items-center">
                  {stat.icon}
                  <CardTitle className="text-lg font-semibold">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-center mt-2">
                  {currentValue}
                  {(stat.label === 'Consultations' || stat.label === 'Patients') &&
                    '+'}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default StatsSection