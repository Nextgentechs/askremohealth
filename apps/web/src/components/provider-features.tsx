import {
  Brain,
  Calendar,
  Clock,
  Globe,
  Plane,
  Search,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'
import type React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  secondaryIcon?: React.ReactNode
  secondaryText?: string
}

const Feature = ({
  icon,
  title,
  description,
  secondaryIcon,
  secondaryText,
}: FeatureProps) => (
  <Card className="h-full transition-all duration-200 hover:shadow-md">
    <CardHeader>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-full bg-blue-50 text-blue-600">{icon}</div>
        <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-gray-600 text-base">
        {description}
      </CardDescription>

      {secondaryIcon && secondaryText && (
        <div className="flex items-center gap-2 mt-4 text-gray-600">
          <div className="text-blue-500">{secondaryIcon}</div>
          <p className="text-sm">{secondaryText}</p>
        </div>
      )}
    </CardContent>
  </Card>
)

export function ProviderFeatures() {
  const features = [
    {
      icon: <Users size={24} />,
      title: 'Expand Your Practice',
      description:
        'List your services and connect with patients who need medical consultations.',
      secondaryIcon: <Globe size={16} />,
      secondaryText: 'Reach more patients in your area',
    },
    {
      icon: <Calendar size={24} />,
      title: 'Online Appointment Management',
      description:
        'Easily manage bookings and provide virtual care through secure video calls and chats.',
      secondaryIcon: <Video size={16} />,
      secondaryText: 'Secure video consultations',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Targeted Digital Marketing',
      description:
        'Boost visibility and grow your practice with customized healthcare marketing strategies. Our marketing tools help you enhance visibility and reach more patients effectively.',
      secondaryIcon: <Search size={16} />,
      secondaryText: 'Optimized for healthcare search',
    },
    {
      icon: <Plane size={24} />,
      title: 'Medical Tourism Service',
      description:
        'We provide medical tourism services by linking you up to preferred hospitals across the world.',
      secondaryIcon: <Globe size={16} />,
      secondaryText: 'Global healthcare network',
    },
    {
      icon: <Brain size={24} />,
      title: 'AI Medical Referral',
      description:
        "Our AI pre-diagnosis screening connects you with the right patients, reducing unnecessary visits and saving time. With better-matched cases, you can focus on delivering quality care where it's needed most.",
      secondaryIcon: <Clock size={16} />,
      secondaryText: 'Save time with smart matching',
    },
  ]

  return (
    <section className="container mx-auto mt-20 sm:mt-0 flex flex-col items-center gap-6 py-2">
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              secondaryIcon={feature.secondaryIcon}
              secondaryText={feature.secondaryText}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
