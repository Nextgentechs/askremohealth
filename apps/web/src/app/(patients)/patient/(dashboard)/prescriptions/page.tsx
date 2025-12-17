import { PrescriptionsList } from './_components/prescriptions-list'

export const metadata = {
  title: 'My Prescriptions',
  description: 'View your prescription history',
}

export default function PrescriptionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Prescriptions</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your prescription history
        </p>
      </div>
      <PrescriptionsList />
    </div>
  )
}
