import { CalendarClock, FileSearch, Hospital } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

const howItWorks = [
  {
    title: 'Search for Doctor or Hospital',
    icon: <FileSearch color="#B95000" size={40} absoluteStrokeWidth={true} />,
    description:
      'Find the right doctor or hospital by filtering through speciality, location or name',
    bgColor: 'bg-[#FEF7E0]',
  },
  {
    title: 'Book an Appointment',
    icon: (
      <CalendarClock color="#C5221F" size={40} absoluteStrokeWidth={true} />
    ),
    description:
      'Schedule an appointment—whether online or in-person. Get instant confirmations and timely reminders.',
    bgColor: 'bg-[#FEF0ED]',
  },
  {
    title: 'Attend Your Appointment',
    icon: <Hospital color="#137333" size={40} absoluteStrokeWidth={true} />,
    description:
      'Meet your doctor either virtually through a video call or in person at a hospital or clinic',
    bgColor: 'bg-[#E6F4EA]',
  },
]

const HowItWorksCard = ({ item }: { item: (typeof howItWorks)[number] }) => (
  <Card className="flex h-full flex-col items-center justify-center border p-6 shadow-sm">
    <CardHeader className="flex flex-col items-center">
      <CardTitle
        className={`flex size-16 rounded-full items-center justify-center ${item.bgColor}`}
      >
        {item.icon}
      </CardTitle>
      <CardDescription className="text-lg lg:text-xl font-medium text-primary text-center">
        {item.title}
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center text-muted-foreground">
      {item.description}
    </CardContent>
  </Card>
)

export default function HowItWorks() {
  return (
    <div className="w-full bg-secondary">
    <section
      id="how-it-works"
      className="container mx-auto flex flex-col items-center gap-6 py-16"
    >
      <h2 className="section-title">How It works</h2>

      <div className="grid grid-rows-3 gap-6 md:grid-cols-3 md:grid-rows-1">
        {howItWorks.map((item, index) => (
          <HowItWorksCard key={index} item={item} />
        ))}
      </div>
    </section>
    </div>
  )
}
